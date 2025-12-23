from fastapi import FastAPI
import networkx as nx

app = FastAPI(title='Scheduler Agent')


@app.get('/live')
def live():
    return {'status': 'ok', 'service': 'scheduler-agent'}


@app.get('/ready')
def ready():
    return {'ready': True}


@app.post('/schedule')
def schedule(tasks: dict):
    # placeholder: return tasks as scheduled order
    G = nx.DiGraph()
    for t in tasks.get('tasks', []):
        G.add_node(t.get('id'))
    order = list(G.nodes)
    return {'order': order}
