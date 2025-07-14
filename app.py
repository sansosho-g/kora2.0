from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph,END,add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver
from fastapi import FastAPI,Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from langchain_tavily import TavilySearch
import json
from typing import TypedDict,Annotated,Optional
from langchain_core.messages import AIMessage,HumanMessage,ToolMessage,AIMessageChunk
import uvicorn
import os
load_dotenv()




# defining tools and llm
search_tool = TavilySearch(max_results=2)
tools = [search_tool]


llm_with_tools = ChatOpenAI(model="gpt-4o").bind_tools(tools=tools)

#building state

class BaseState(TypedDict):
    messages:Annotated[list,add_messages]

# building graph and nodes
TOOL_NODE = "tool_node"
MODEL = "model"

async def model(state: BaseState):
    msgs = state['messages']
    ouptut = await llm_with_tools.ainvoke(msgs)
    return {
        "messages":[ouptut]
    }

async def tool_router(state:BaseState):
    last_msg = state['messages'][-1]
    if hasattr(last_msg,"tool_calls") and len(last_msg.tool_calls)>0:
        return TOOL_NODE
    else:
        return END
    
async def tool_node(state:BaseState):
    tool_calls = state["messages"][-1].tool_calls
    tool_messages = []
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]

        # Handling the search tool
        if tool_name == "tavily_search":
            search_results = await search_tool.ainvoke(tool_args)

            tool_message = ToolMessage(content=str(search_results),tool_call_id=tool_id,name=tool_name)

            tool_messages.append(tool_message)
    return {
        "messages":tool_messages
    }

# Let's build Graph
DB_URI = os.getenv("MONGODB_URI", "mongodb://admin:password123@localhost:27017/langgraph_db?authSource=admin")
DB_NAME = os.getenv("MONGODB_DATABASE", "langgraph_db")

# Global variables to store the MongoDB connection and compiled graph
context_manager = None
checkpointer = None
graph = None

async def initialize_graph():
    global context_manager, checkpointer, graph
    # Create the context manager and enter it to get the actual saver
    # You can customize collection names here if needed:
    context_manager = AsyncMongoDBSaver.from_conn_string(
        DB_URI,
        db_name=DB_NAME,
        checkpoint_collection_name="perplexity_checkpoints",
        writes_collection_name="perplexity_writes"
    )
    # context_manager = AsyncMongoDBSaver.from_conn_string(DB_URI)
    checkpointer = await context_manager.__aenter__()
    
    graph_builder = StateGraph(BaseState)

    graph_builder.add_node(MODEL,model)
    graph_builder.add_node(TOOL_NODE,tool_node)
    graph_builder.set_entry_point(MODEL)
    graph_builder.add_conditional_edges(MODEL,tool_router)
    graph_builder.add_edge(TOOL_NODE,MODEL)

    # Compile graph with checkpoint
    graph = graph_builder.compile(checkpointer=checkpointer)

async def cleanup_graph():
    global context_manager
    if context_manager:
        await context_manager.__aexit__(None, None, None)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Cache-Control", "X-Requested-With"]
)

@app.on_event("startup")
async def startup_event():
    await initialize_graph()

@app.on_event("shutdown")
async def shutdown_event():
    await cleanup_graph()

def serialize_ai_message_chunk(chunk):
    if isinstance(chunk,AIMessageChunk):
        return chunk.content
    else:
        raise TypeError(
            "Object of type {type(chunk).__name__} is not correctly formmated for serialization"
        )

async def generate_chat_response(message:str,checkpoint_id:Optional[str] = None):
    try:
        is_new_conversation = checkpoint_id is None

        if is_new_conversation:
            # generating new checkpoint id
            new_checkpoint_id = str(uuid4())
            config = {
                "configurable" : {
                    "thread_id":new_checkpoint_id
                }
            }

            #Intialize with first message
            events = graph.astream_events(
                {"messages":[HumanMessage(content=message)]},
                config=config,
                version="v2"
                )
            # first send the checkpoint Id
            yield f"data: {{\"type\": \"checkpoint\", \"checkpoint_id\": \"{new_checkpoint_id}\"}}\n\n"

        else:
            config = {
                "configurable" : {
                    "thread_id":checkpoint_id
                }
            }
            # continue existing messages
            events = graph.astream_events(
                {"messages":[HumanMessage(content=message)]},
                config=config,
                version="v2"
                )

        async for event in events:
            event_type = event["event"]
            
            if event_type == "on_chat_model_stream":
                chunk_content = serialize_ai_message_chunk(event["data"]["chunk"])
                # Use json.dumps to properly escape the content
                content_json = json.dumps(chunk_content)
                yield f"data: {{\"type\": \"content\", \"content\": {content_json}}}\n\n"
            elif event_type == "on_chat_model_end":
                # Check if there are tool calls for search
                tool_calls = event["data"]["output"].tool_calls if hasattr(event["data"]["output"], "tool_calls") else []
                search_calls = [call for call in tool_calls if call["name"] == "tavily_search"]
                
                if search_calls:
                    # Signal that a search is starting
                    search_query = search_calls[0]["args"].get("query", "")
                    # Use json.dumps to properly escape the query
                    query_json = json.dumps(search_query)
                    yield f"data: {{\"type\": \"search_start\", \"query\": {query_json}}}\n\n"
                    
            elif event_type == "on_tool_end" and event["name"] == "tavily_search":
                # Search completed - send results or error
                output = event["data"]["output"]["results"]
                
                # Check if output is a list 
                if isinstance(output, list):
                    # Extract URLs from list of search results
                    urls = []
                    for item in output:
                        if isinstance(item, dict) and "url" in item:
                            urls.append(item["url"])
                    
                    # Convert URLs to JSON and yield them
                    urls_json = json.dumps(urls)
                    yield f"data: {{\"type\": \"search_results\", \"urls\": {urls_json}}}\n\n"
        
        # Send an end event after all events are processed
        yield f"data: {{\"type\": \"end\"}}\n\n"
        
    except Exception as e:
        yield f"data: {{\"type\": \"error\", \"message\": \"{str(e)}\"}}\n\n"
        yield f"data: {{\"type\": \"end\"}}\n\n"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend service is running"}

@app.get("/chat_stream/{message}")
async def chat_stream(message:str,checkpoint_id: Optional[str] = Query(None)):
    return StreamingResponse(
        generate_chat_response(message,checkpoint_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Credentials": "true"
        }
    )

if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8001)

