class Container extends React.Component {
    constructor(props){
        super(props)
        this.state={login:"",isConnected:false,messEnCours:"", tableauMessage:[], tableUser:[]}
        this.changeLogin=this.changeLogin.bind(this)
        this.changeConnect=this.changeConnect.bind(this)
        this.changeMessage=this.changeMessage.bind(this)
        this.sendMessage=this.sendMessage.bind(this)

       
    }
    componentDidMount() {
        this.ws = new WebSocket('ws://localhost:8124/')
        //this.ws = new WebSocket('wss://ws.jdedev.fr:8124')

        this.ws.onopen = () => {

            console.log("connect ok");
            this.ws.send(JSON.stringify({mess:"coucou"}))

        }
        this.ws.onerror = (err) => {
            console.log(err);
          }
          this.ws.onmessage =(mess)=>{
              let messrecu = JSON.parse(mess.data)
              console.log(messrecu);
              if(messrecu.typeTrame=="message"){
                  this.setState({tableauMessage:[...this.state.tableauMessage,{user:messrecu.from,date:new Date(messrecu.date),message:messrecu.content,me:false}]})
              }

              else if(messrecu.typeTrame=="lstUser"){
                  this.setState({tableUser:messrecu.users})
              }

          }
    }

    changeLogin(event){
        
        this.setState({login:event.target.value})
        //event.target.value por las input
        //event.target.cheked por las checkbox 
        //event.target.selected por las selectbox
    }

    changeMessage(event){
        this.setState({messEnCours:event.target.value})
    }

    changeConnect(){
        if(this.state.isConnected==true){
            this.setState({login:""})
            this.setState({tableUser:[]})
            this.setState({tableauMessage:[]})
            this.ws.send(JSON.stringify({ type: "", typeTrame: "logOut", nom: this.state.login, id: "0" }))

        }

        else{
            this.setState({tableUser:[...this.state.tableUser,{nom:this.state.login}]})
            this.ws.send(JSON.stringify({ type: "", typeTrame: "user", nom: this.state.login, id: "0" }))
        }       
        this.setState({isConnected:!this.state.isConnected})
        
    }

    sendMessage(event){
        //ajoute message au tableau
        // let tab = JSON.parse(JSON.stringify(this.state.tableauMessage))
        // tab.push({user:this.state.login,date:new Date(),message:this.state.messEnCours})
        // this.setState({tableauMessage:tab})
        this.setState({tableauMessage:[...this.state.tableauMessage,{user:this.state.login,date:new Date(),message:this.state.messEnCours,me:true}]})

        this.ws.send(JSON.stringify({ type: "", typeTrame: "message", from: this.state.login, content: this.state.messEnCours, date: new Date() }))
        
        this.setState({messEnCours: ""})
      
        
        
    }


    render() {
        return (
            <div className="conteneur">
                <Header login={this.state.login} changeLogin={this.changeLogin} isConnected={this.state.isConnected} changeConnect={this.changeConnect}/>
                <Body isConnected={this.state.isConnected} messEnCours={this.state.messEnCours} changeMessage={this.changeMessage} sendMessage={this.sendMessage} 
                tableauMessage={this.state.tableauMessage} tableUser={this.state.tableUser}/>
            
              
            </div>
        )

    }

}

   



function Header (props){
    let affCon
    if(props.isConnected==false){
        affCon=<div>
                    <input type="text" placeholder="Login" value={props.login} onChange={props.changeLogin}/>
                    <button onClick={props.changeConnect}>Log in</button>
                </div>
    }

    else{
        affCon=<div>
        <p className="text">Coucou {props.login} ! </p>
        <button onClick={props.changeConnect}>Log out</button>
        </div>
    }
    return (

        <div className="header">
            <div className="titre flex justify">
                    <div className="flex"><h1>MimiChat</h1><i className="fas fa-users"></i></div>

                {affCon}

            </div>
        </div>
    )
}


function DetailMessage(props){
    let me="no"
    if(props.obj.me){
        me="si"
    }
    return(

    <div className={me}>
        <div>
            <div className="message">{props.obj.message}</div>
        </div>
        
        <div className="flex justify">
            <div className="nom">{props.obj.user}</div>
            <div className="date">{props.obj.date.toLocaleTimeString()}</div>
            </div>

        

    </div>

    )
}

function Body (props){

   
    let textareaclass = ""

    if(props.isConnected==true){

        textareaclass= "display"
    }

    else{

        textareaclass =  'display_none'

    }
    console.log(props.tableauMessage);
    return (

        <div className="body">

            <div className="flex">
                
                <div className="width_20">
                    <h2>Qui est là?</h2>
                    {props.tableUser.map((elem, key) => <div className="user" key={key}>{elem.nom} <i className="far fa-smile"></i></div>)}
                </div>
                
                <div className="column width_80">
                
                    
                    <div className="height_70">
                        <div>
                  
                    {props.tableauMessage.map((elem, key) => <DetailMessage obj={elem} key={key}></DetailMessage>)}
                    {/* afficher les messages avec fonction map */}
               
                        </div>
                    </div>
                    <div className="flex height_30">
                        <textarea className={textareaclass} value={props.messEnCours} onChange={props.changeMessage}></textarea>
                        <button className={textareaclass} id='envoyer' onClick={props.sendMessage}>Envoyer</button>
                    </div>
                </div>

            </div>
        </div>
    )
}



ReactDOM.render(<Container/>, document.getElementById("app"))