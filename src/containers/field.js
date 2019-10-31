import React, { Component }  from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import  * as selectors from "../store/reducer";
import * as actions from '../store/actions';
import Vertex from '../components/Vertex';
import '../style/field.css'
import { Alg , Perevod} from '../store/algoritm'

class Field extends Component {
    constructor(props){
        super(props);
        autoBind(this);
        this.state = {
            edgeRef : React.createRef(),
            edgeValueRef : React.createRef(),
            FlagToAlg : false,
            VertexRefs : [],
            activRef : undefined,
            VertexEdgeRef : undefined,
            fieldRef : React.createRef(),   
        }

    }
    componentWillMount(){
        let id = this.props.VertexId;
        let a = {};
        a[id] = {
            name : String.fromCharCode(id % 27 + 65),
            id : String.fromCharCode(id % 27 + 65),
            VerState : [],
        }
        this.props.addVertex(a);
    }
    componentDidMount(){
        //фиговое решение , нужно рабоать с css height 
       document.getElementById('SVGfield').style.height = this.state.fieldRef.current.clientHeight;
    }
    updateDataFlags(value={}){
        for(let key in value){
            //я не могу добиться синхронной работы setState - а это очень важно !!! 
            this.state[key] = value[key];
        }
    }
    AddVertex(){
        this.state.VertexEdgeRef = undefined;

        [].slice.call(document.querySelectorAll('div.activToMove'))
        .forEach( function(a){ a.classList.remove('activToMove') });
        [].slice.call(document.querySelectorAll('line.activLine'))
        .forEach( function(a){ a.classList.remove('activLine')  });
        [].slice.call(document.querySelectorAll('div.activ'))
        .forEach( function(a){ a.classList.remove('activ') });

        let id = this.props.VertexId;

        let a = {};
        a[id] = {
            name : String.fromCharCode(id % 27 + 65),//нужно снять ограничения на размер [26] символов
            id : String.fromCharCode(id % 27 + 65),
            VerState : [],
            ref : undefined,
        }
        this.props.addVertex(a);
       
    }
    animate({duration, draw, timing}) {
        let start = performance.now();
        requestAnimationFrame(function animate(time) {
          let timeFraction = (time - start) / duration;
          if (timeFraction > 1) timeFraction = 1;
          let progress = timing(timeFraction)
          draw(progress);
          if (timeFraction < 1) {
            requestAnimationFrame(animate);
          }
        });
    }
    fielOnClick(event){
        if(this.state.activRef){
        let field =  this.state.fieldRef.current;
        let fieldCoords = this.state.fieldRef.current.getBoundingClientRect();
        let vertex = this.state.activRef;

        let ballCoords = {
        top: event.clientY - fieldCoords.top - field.clientTop - vertex.clientHeight / 2,
        left: event.clientX - fieldCoords.left - field.clientLeft - vertex.clientWidth / 2
        };

        if (ballCoords.top < 0) ballCoords.top = 0;
        if (ballCoords.left < 0) ballCoords.left = 0;
        if (ballCoords.left + vertex.clientWidth > field.clientWidth) {
        ballCoords.left = field.clientWidth - vertex.clientWidth;
        }
        if (ballCoords.top + vertex.clientHeight > field.clientHeight) {
        ballCoords.top = field.clientHeight - vertex.clientHeight;
        }

        let XY = vertex.getBoundingClientRect();
        if(XY.top < event.clientY && event.clientY < XY.top + XY.height && 
        XY.left < event.clientX && event.clientX < XY.left + XY.width
        ) return;
        
        vertex.style.transitionProperty = 'all';
        vertex.style.transitionDuration = '0.8s';
        vertex.style.transform = 'translate(' + ballCoords.left +'px,' + ballCoords.top + 'px)';
        
        if( Object.keys( this.props.VertexCollection ).length === 0 || 
         this.props.VertexCollection[vertex.id.codePointAt(0) - 65].VerState.length===0) return;

        let Paint = this.Paint;
        let props = this.props;
        
        this.animate({
            duration: 1500,
            timing: function(timeFraction) {
              return timeFraction;
            },
            draw: function(){
                let state = props.VertexCollection[vertex.id.codePointAt(0) - 65].VerState;
                state.forEach( function(a){
                  Paint( vertex, a );
                })
            }
          });
        } 
    }
    Paint( obj1, obj2, data = {Line : undefined, Edge : undefined} ){
        let Per = Perevod( obj1.id.codePointAt(0) - 65 ,obj2.id.codePointAt(0) - 65 );
        if(this.props.EdgeLineObj[Per] === undefined && !data.Line) return;
        let XY1 = obj1.getBoundingClientRect();
        let XY2 = obj2.getBoundingClientRect();
        let field = this.state.fieldRef.current;
        var XYField = this.state.fieldRef.current.getBoundingClientRect(); 

        let Line =  data.Line || this.props.EdgeLineObj[Per].Line ;
        Line.setAttribute('x1', XY1.left - XYField.left - field.clientLeft + XY1.width / 2 );
        Line.setAttribute('y1', XY1.top - XYField.top - field.clientTop + XY1.height / 2 );
        Line.setAttribute('x2', XY2.left - XYField.left - field.clientLeft + XY2.width / 2 );
        Line.setAttribute('y2', XY2.top  - XYField.top - field.clientTop + XY2.height / 2);
         
        this.state.edgeRef.current.append(Line);

        let Edge = data.Edge || this.props.EdgeLineObj[Per].Edge ;
        let xLine = Line.x1.animVal.value > Line.x2.animVal.value ? Line.x2.animVal.value : Line.x1.animVal.value , 
            yLine = Line.y1.animVal.value > Line.y2.animVal.value ? Line.y2.animVal.value : Line.y1.animVal.value;
        Edge.style.left = xLine + Math.abs( Line.x1.animVal.value - Line.x2.animVal.value ) / 2  + 'px';
        Edge.style.top = yLine + Math.abs( Line.y1.animVal.value - Line.y2.animVal.value ) / 2 + 'px';
        
        this.state.edgeValueRef.current.append(Edge);
    }
    DellVertex(){
        if(Object.keys( this.props.VertexCollection).length === 0 ) return;
        if(this.state.FlagToAlg){
            [].slice.call(document.querySelectorAll('div.show')).
            forEach( (a) => a.classList.remove('show') );
            [].slice.call(document.querySelectorAll( 'line.showLine')).
            forEach( (a) => a.classList.remove('showLine') );
            this.state.FlagToAlg = false;
        }
        if(this.state.activRef){
            let ind = this.state.activRef.id.codePointAt(0) - 65;
            if(this.state.activRef === this.state.VertexEdgeRef){
                this.state.VertexEdgeRef.classList.remove('activ');
                this.state.VertexEdgeRef = undefined;
            }
            this.state.activRef.classList.remove('activToMove');
            this.state.activRef = undefined;
            this.props.DellVertex(ind);
        }
    }
    Alg(){
        if(this.state.FlagToAlg){
            document.querySelectorAll('line.showLine').forEach( function(a){ a.classList.remove('showLine') });
            document.querySelectorAll('div.show').forEach( function(a){ a.classList.remove('show') });
            this.state.FlagToAlg = false;
            return;
        }
        if( Object.keys(this.props.EdgeLineObj).length > 1 ) {
        
        this.state.FlagToAlg = true ;
        document.querySelectorAll('div.edge.activToMove').forEach( function(a){ a.classList.remove('activToMove') });
        document.querySelectorAll('line.activLine').forEach( function(a){ a.classList.remove('activLine') });
        
        let arr = Alg( this.props.EdgeLineObj );//, Object.keys(this.props.VertexCollection).length
        let p = '';
        var para = document.createElement("p") ;
        
        arr.forEach( function(a) {//мешанина полная , нужно что то придумать 
          let id1 = String.fromCharCode(a[0] + 65) ,
              id2 = String.fromCharCode(a[1] + 65) ;

          let Per = Perevod( id1.codePointAt(0) - 65 , id2.codePointAt(0) - 65 );

          document.getElementById( 'EdgeValue-' + Per ).classList.add('show') ;
          document.getElementById( 'Line-' + Per ).classList.add('showLine') ;
            
          p = String.fromCharCode( a[0] + 65 ) + " - " + String.fromCharCode( a[1]  + 65) + 
          " ( " + a[2] + " )" ;
          para.appendChild(document.createTextNode( p )) ;
          para.appendChild(document.createElement("br"));
        }); 
        
        arr = {};
        document.getElementById('FinalList').append(para) ;
      } 
    }
    render(){
         
        let VertexCollection = this.props.VertexCollection;
        return(  
        <div>
            <div>double click - select an object to connect. single mouse click - select adjacent edges and move the object.<br/>
            <button accessKey="1" onClick={this.AddVertex} >Add</button>
            <button accessKey="2" onClick={this.Alg}>Algoritm</button>
            <button accessKey="3" type = "button" onClick={this.DellVertex}>Del</button>
            </div>
            <div className='field' onClick={this.fielOnClick} ref = {this.state.fieldRef}>
                <svg  xmlns="http://www.w3.org/2000/svg" id = 'SVGfield'>
                    <g ref={this.state.edgeRef}></g>
                </svg>
                {Object.keys(VertexCollection).map( key => (
                    <Vertex 
                        name = {VertexCollection[key].name}
                        id = {VertexCollection[key].id}
                        key = {VertexCollection[key].id + '_vertex'}
                        UpdateDataFlags= {this.updateDataFlags}
                        flags = {this.state}
                        GetActivRef = {()=>this.state.activRef}
                        GetVertexEdgeRef = {()=>this.state.VertexEdgeRef}
                        GetFlagToAlg = { ()=>this.state.FlagToAlg}
                        Paint = {this.Paint}
                        fieldRef = {this.state.fieldRef}
                        
                    />
                ))}
                <div ref={this.state.edgeValueRef}></div>
            </div>
            <div id='FinalList'></div>
         </div>  
        )
    }
}

function mapStateToProps(state) {
    return {
        VertexCollection : selectors.GetObjVertex(state),
        VertexId : selectors.GetIdVertex(state),
        EdgeLineObj : selectors.GetObjEdgeLine(state),
    };
}

function mapDispatchToProps (dispatch){
    return {
        addVertex: ( info, ind) => {
            dispatch( actions.addVertex(info, ind) )
        },
        addEdgeLine: (edge) => {
            dispatch( actions.addEdgeLine(edge) )
        },
        DellVertex : (edgeId) => {
            dispatch( actions.DellVertex(edgeId))
        },
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Field);
