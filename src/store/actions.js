import * as types from './ActionsType'
//получает готовый объект вершины , его компановка - на стороне контейнера (или хз чего)
export function addVertex(Vertex){ 
    return {
        type : types.Add,
        Vertex : Vertex,
    }
};
export function addEdgeLine(data){ // передаем объект : ключь - индекс , значение ключа - вес ребра 
    return {
        type : types.AddEdgeLine,
        EdgeLine : data,
    }
};
export function DellVertex(VertexInd){
    return {
        type : types.DellVertex,
        VertexInd : VertexInd
    }
}

export function setVertexState( data ){
    return {
        type : types.SetVerState,
        newState : data.state,
        ind : data.ind,
        ref : data.ref
    }
}