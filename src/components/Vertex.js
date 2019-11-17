import React from 'react';
import autoBind from 'react-autobind';
import '../style/vertex.css';
import { connect } from 'react-redux';
import { Perevod } from '../store/algoritm';
import  * as selectors from "../store/reducer";
import * as actions from '../store/actions';

class Vertex extends React.Component { 
    constructor(props){
        super(props);
        autoBind(this);
        this.state = { ref : React.createRef() }
    }
    componentDidMount(){
        let ref = this.state.ref.current;
        this.props.UpdateDataFlags( {activRef : ref } );
        this.props.setVertexState({
            ind : ref.id.codePointAt(0) - 65, 
            ref : ref,
        });
    }
    handlClick(){
        if( this.props.GetActivRef() !== this.state.ref.current ){ 
            [].slice.call(document.querySelectorAll('div.activToMove')).
            forEach( function(a){ a.classList.remove('activToMove') });
            [].slice.call(document.querySelectorAll('line.activLine')).
            forEach( function(a){ a.classList.remove('activLine') });
            
            this._reactInternalFiber.child.stateNode.classList.add('activToMove');
            this.props.UpdateDataFlags({
                                        activRef : this.state.ref.current,
                                        VertexEdgeRef : this.props.GetVertexEdgeRef()
            });
        } else {
            if( !this.props.GetFlagToAlg() ){ 
                let  ThisId = this.state.ref.current.id;

                let arr = this.props.LineState(ThisId);
                let props = this.props;
                arr.forEach( function(a){
                    let Per = Perevod( a.id.codePointAt(0) - 65, ThisId.codePointAt(0) - 65 );
                    props.EdgeLineObj[Per].Edge.classList.toggle('activToMove');
                    props.EdgeLineObj[Per].Line.classList.toggle('activLine');
                });

                this.props.UpdateDataFlags({
                    VertexEdgeRef : this.props.GetVertexEdgeRef(),
                });
            };
        }
    }
    dblclick(){
        if(this.props.GetFlagToAlg()){
            [].slice.call(document.querySelectorAll('div.show')).
            forEach( (a) => a.classList.remove('show') );
            [].slice.call(document.querySelectorAll( 'line.showLine')).
            forEach( (a) => a.classList.remove('showLine') );
        }
        this.props.UpdateDataFlags( { FlagToAlg : false,
          VertexEdgeRef : this.props.GetVertexEdgeRef(),
        });
        //GetVertexEdgeRef

        let divThis = this.state.ref.current;
        let VertexEdgeRef = this.props.GetVertexEdgeRef();
        
        if( divThis !== VertexEdgeRef && VertexEdgeRef===undefined ){
            divThis.classList.toggle("activ");
            this.props.UpdateDataFlags({ VertexEdgeRef : divThis });
        } else if( divThis !== VertexEdgeRef ){
          [].slice.call(document.querySelectorAll('div.activToMove')).
          forEach( function(a){ a.classList.remove('activToMove') });
          [].slice.call(document.querySelectorAll('line.activLine')).
          forEach( function(a){ a.classList.remove('activLine')  });
          
          let key = Perevod( divThis.id.codePointAt(0) - 65 , VertexEdgeRef.id.codePointAt(0) - 65 );
          if(this.props.EdgeLineObj[key] === undefined){
            let a = {};
            let value = Math.floor(1 + Math.random() * (50));

            let div = document.createElement('div');
            div.innerHTML = value;
            div.classList.add('edge');
            div.setAttribute('id','EdgeValue-' + key ); 

            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('id', 'Line-' + key );

            a[key] = { EdgeValue : value,
                       Edge : div,
                       Line : line,
                    };
         
            this.props.setVertexState({
                ind : divThis.id.codePointAt(0) - 65,
                state : VertexEdgeRef
            });
            this.props.setVertexState({
                ind : VertexEdgeRef.id.codePointAt(0) - 65, 
                state : divThis
            });
            this.props.addEdgeLine( { 
                [key] : {   EdgeValue : value,
                            Edge : div,
                            Line : line,}
             } );

            this.props.Paint( divThis, VertexEdgeRef, { Edge : div, Line : line});
          }
          
          VertexEdgeRef.classList.remove('activ');
          divThis.classList.add('activ');
          divThis.classList.add('activToMove');
          this.props.UpdateDataFlags({ VertexEdgeRef : divThis });
         }
        else {
            divThis.classList.remove("activ");
            this.props.UpdateDataFlags({ VertexEdgeRef : undefined });
        }
    }
    render(){
        return (
                <div className='vertex activToMove'
                 key={this.props.id}
                 id = {this.props.id} 
                 onClick={this.handlClick} 
                 onDoubleClick={this.dblclick}
                 ref={this.state.ref}
                >
                 {this.props.name}
                </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        EdgeLineObj : selectors.GetObjEdgeLine(state),
        LineState : (ind) => selectors.GetVerState(state, ind)
    };
}

function mapDispatchToProps (dispatch){
    return {
        addEdgeLine: (data) => {
            dispatch( actions.addEdgeLine(data) )
        },
        setVertexState: (ind, state, ref) => {
            dispatch( actions.setVertexState(ind, state, ref))
        }
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Vertex);