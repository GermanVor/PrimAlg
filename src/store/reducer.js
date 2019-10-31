import * as types from './ActionsType'
import {Perevod} from '../store/algoritm'

export default function reducer(state = {ObjVertex : {}, ObjEdgeLine : {}}, action) {
    
    switch (action.type) {
        case types.Add: {
            return {...state, ObjVertex : {...state.ObjVertex , ...action.Vertex} };
        }
        case types.AddEdgeLine: {
            return {...state, ObjEdgeLine : {...state.ObjEdgeLine , ...action.EdgeLine} };
        }
        case types.ClearAll: {
            return { ObjVertex : [], ObjEdge : {} };
        }
        case types.SetVerState: {//
            if(action.newState)
            state.ObjVertex[action.ind].VerState.push(action.newState);

            if(action.ref)
            state.ObjVertex[action.ind].ref = action.ref;

            return {...state} 
        }
        case types.DellVertex: {
            let obj = state.ObjVertex[action.VertexInd];
            obj.VerState.forEach(function(a){
                let ref = state.ObjEdgeLine[Perevod( a.id.codePointAt(0) - 65, obj.id.codePointAt(0) - 65)];
                let arr = state.ObjVertex[ a.id.codePointAt(0) - 65].VerState;
                state.ObjVertex[ a.id.codePointAt(0) - 65].VerState = arr.filter( a => a.id !== obj.id);
                delete state.ObjEdgeLine[Perevod( a.id.codePointAt(0) - 65, obj.id.codePointAt(0) - 65)];
                ref.Line.remove();
                ref.Edge.remove();
            });
            
            delete state.ObjVertex[action.VertexInd];
            return {...state};
        }
        default:
            return {...state};
    };
}
//selectors 
export function GetObjVertex(state){ 
    return {...state.ObjVertex};
};

export const GetIdVertex = function(state){
    let i = 0;
    while(state.ObjVertex[i]){
        i++;
    }
    return i;
}
  
export function GetObjEdgeLine(state) {
    return Object.assign({}, state.ObjEdgeLine);
};

export function GetVerState(state, name){
    let ind = name.codePointAt(0) - 65;
    return state.ObjVertex[ind].VerState.concat();
}
