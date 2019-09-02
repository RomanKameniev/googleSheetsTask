import React from 'react';
import axios from 'axios';

export default class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			link: "https://docs.google.com/spreadsheets/d/1c0iXpjQJHNtdZKASrwt0Ng4XeQJBvNaiHNjev_hDTrY/edit?usp=sharing",
			up_server: "server not connected"
		}
	}

	componentDidMount() {
		// Call our fetch function below once the component mounts
		this.callBackendAPI()
	}

	callBackendAPI = async () => {
		axios.get('/express_backend')
			.then(res => this._checkResponse(res))
			.then(data => data && this.setState({up_server: data.up_server}))
	};


	_onSubmit = () => (e) => {
		e.preventDefault()
		let link = this.refs.inp.value
		//this.setState({link})
		this._searchTables({link})
	}

	_searchTables = (link) => {
		console.log(' _getTablesTitles', link)
		this.setState({link})
		axios.post('/searchTablesTitles',link)
			.then(res => this._checkResponse(res))
			.then(data => {
				if(data && data.tables_name.length >= 3){
					this.setState({
						tables_name: data.tables_name, 
						titleA: data.tables_name[0],
						titleB: data.tables_name[1],
						titleC: data.tables_name[2],
					})
				}
			})
		//this._getTables()
	}
	_getTables = async () => {
		let {titleA, titleB, titleC, link} = this.state 
		console.log(' _getTables', link)
		let titles = {a:titleA, b: titleB, c: titleC}
		axios.post('/getTables',{ titles, link})
			.then(res => this._checkResponse(res))
			.then(data => data && this.setState({tables:data.tables}))
	}
	_sortTables = async () => {
		let {titleA, titleB, titleC, link} = this.state 
		console.log(' _getTables', link)
		let titles = {a:titleA, b: titleB, c: titleC}
		axios.post('/sortTables',{ titles, link})
			.then(res => this._checkResponse(res))
			.then(data => data && this.setState({tableC:data.tableC}))

	}

	_checkResponse = (res) => {
		let {data, status} = res
		if(status == 200){
			console.log('data => ',data)
			return data
		}
		if(status == 500) {
			console.log(' server error')
			return false
		}

	}

	render(){
		console.log('this.state =>', this.state)
		let {up_server, tables_name, tables, tableC} = this.state
		return (
			<div className="container-fluid" style={styles.container}>
				<div className="row " style={styles.header}>
					<div className="col-lg-12 py-3 " style={styles.title}>
						<h2>Google Sheets task</h2>
					</div>
				</div>
				<div className="body" style={styles.body}>
					<div className="col-lg-1 py-3" style={styles.input}>
						<input ref='inp' type="text" size="100" border="3" defaultValue={this.state.link} onSubmit={this._onSubmit()}/>
						<button onClick={this._onSubmit()} style={styles.button}> Get Titles </button>
					</div>
					<div>
						<h4>Server Status:</h4>
						{up_server && up_server}
					</div>
					{tables_name && <div>
						<h5>Select Tables: </h5>
						<div className='row'>
							Table A :  
							<select value={this.state.titleA} style={styles.select} onChange={(e) => this.setState({titleA:e.target.value})}>
								{tables_name.map( name => {
									return <option value = {name}>{name}</option>
								})}
							</select>
						</div>
						<div className='row'>
							Table B :  
							<select value={this.state.titleB} style={styles.select} onChange={(e) => this.setState({titleB:e.target.value})}>
								{tables_name.map( name => {
									return <option value = {name}>{name}</option>
								})}
							</select>
						</div>
						<div className='row'>
							Table C :  
							<select value={this.state.titleC} style={styles.select} onChange={(e) => this.setState({titleC:e.target.value})}>
								{tables_name.map( name => {
									return <option value = {name}>{name}</option>
								})}
							</select>
						</div>
						<div className="row">
							<button type='submit' onClick={this._getTables} style={styles.button}>Submit</button>
							<br/>
							{this.state.tables && <button type='submit' onClick={this._sortTables} style={styles.button}>Sort Tables</button>}
						</div>
					</div>
					}
					{tables && 
							<div className='row'>
								<div className="col-md-5" style={styles.tableA}>
									{this.state.titleA}
									<table style={styles.table}>
										<thead>
											<tr>
												<td>First Name</td>
												<td>Last Name</td>
												<td>E-mail</td>
											</tr>
										</thead>
										<tbody>
											{(tables[0] && tables[0].length > 0) &&
													tables[0].map(row => {
														return <tr key ={row.toString()+"A"} style={styles.tr}>
															<td>{row.fn}</td>
															<td>{row.ln}</td>
															<td>{row.em}</td>
														</tr>
													})
											}
										</tbody>
									</table>
								</div>
								<div className="col-md-5" style={styles.tableB}>
									{this.state.titleB}
									<table style={styles.table}>
										<thead>
											<tr>
												<td>First Name</td>
												<td>Last Name</td>
												<td>E-mail</td>
											</tr>
										</thead>
										<tbody>
											{(tables[1] && tables[1].length > 0) &&
													tables[1].map(row => {
														return <tr key = {row.toString()+"B"} style={styles.tr}>
															<td>{row.fn}</td>
															<td>{row.ln}</td>
															<td>{row.em}</td>
														</tr>
													})
											}
										</tbody>
									</table>
								</div>
							</div>
					}
					{tableC && <div className="row">
						<div className="col-md-12" style={styles.tableC}>
							{this.state.titleC}
							<table style={styles.table}>
								<thead>
									<tr>
										<td>First Name</td>
										<td>Last Name</td>
										<td>E-mail</td>
									</tr>
								</thead>
								<tbody>
									{(tableC && tableC.length > 0) &&
											tableC.map(row => {
												return <tr key = {row.toString()+'C'} style={styles.tr}>
													<td>{row.fn}</td>
													<td>{row.ln}</td>
													<td>{row.em}</td>
												</tr>
											})
									}
								</tbody>
							</table>
						</div>
					</div>
					}
				</div>
			</div>	
		)
	}
}

const styles = {
	container:{
		backgroundColor:"#fff",
	},
	header:{
		backgroundColor:"#eee",
	},
	title:{
		color: 'blue',
		textAlign:'center',
	},
	body:{
		margin: 0,
		padding: 0
	},
	button:{
		borderRadius:5,
		margin:5,
	},
	select:{
		margin:20,
		width:100,
	},
	table:{
		width: '100%',
		borderCollapse: 'collapse',
	},
	tableA:{
		left:0,
	},
	tableB:{
		right:0,
	},
	tableC:{
		textAlign:'center',
	},
	tr:{
		border: '#ccc 1px solid',
//		padding: '5px 10px',
	},
	td:{
		border: '#ccc 1px solid',
//		padding: '5px 10px',
	}
};
