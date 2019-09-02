
const GoogleSpreadSheet = require("google-spreadsheet"),
	{promisify} = require("util"),
	Credentions = require("./client_secret.json");

// console.log that your server is up and running

export default class WorkerSheet {

	async _getAccess(link){
		if(!link) link = "https://docs.google.com/spreadsheets/d/1c0iXpjQJHNtdZKASrwt0Ng4XeQJBvNaiHNjev_hDTrY/edit?usp=sharing"

		const idRegex = new RegExp(/(\/d\/)[\w_]+/i);
		let id = idRegex.exec(link);

		if(!id) return "invalid link"
		id = id[0].substr(3)

		console.log('_ getAccess table id =>',id)
		const doc = new GoogleSpreadSheet(id)

		await promisify(doc.useServiceAccountAuth)(Credentions);
		return await promisify(doc.getInfo)();
	}

	async _selectTables(titles, info) {
		let {a,b,c} = titles;
	
		info.worksheets.forEach( i => {
			if(a === i.title){
				a = i;
			}
			if(b === i.title){
				b = i;
			}
			if(c === i.title){
				c = i
			}
		})
		return [a,b,c]
	}

	async _readRows(table){
		return await promisify(table.getRows)({
			offset:1,
		})
	}

	_rowsData(row){
		let data = [];
		Object.keys(row).forEach(i => {
			data.push({fn:row[i].fn, ln: row[i].ln, em: row[i].em})
		})
		return data
	}
	_jsonToString(rows){
		return rows.map(row => JSON.stringify(row))
	}
	_stringToJson(rows){
		return rows.map(row => JSON.parse(row))
	}

	_toOneTable(tables){
		let {a, b} = tables;
		let uniqValues = []

		a = this._jsonToString(a);
		b = this._jsonToString(b);
		let table = [a, b].reduce((acc, val) => acc.concat(val), [])
		console.log('length before sort =>', table.length)	
		for(let i = 0; i < table.length; i++ ){
			if(uniqValues.indexOf(table[i]) == -1){
				uniqValues.push(table[i])
			}
		}
		uniqValues = this._stringToJson(uniqValues)
		console.log('length before sort =>', uniqValues.length)	
		return uniqValues
	}

	async _getTitles(link){
		let titles = []
		let info = await this._getAccess(link);
		const sheets = info.worksheets;
		sheets.forEach(i => {
			titles.push(i.title)
		})
		return titles
	}

	async _setHeaderRow(table){
		return await promisify(table.setHeaderRow)(['fn', 'ln', 'em'] )
	}

	async _setRows(data){

		let {rows, table} = data;
		for(let i = 0; i < rows.length; i++){
			await new Promise(resolve => {
				table.addRow(rows[i], (er, cb) => resolve(cb))
			})
		}
	}

	async _selectTablesData(titles, link){

		let tables = await this._getTableAccess(titles,link)
		
		await this._setHeaderRow(tables[0])
		await this._setHeaderRow(tables[1])
		await this._setHeaderRow(tables[2])

		let tableA = await this._readRows(tables[0]).then(data => this._rowsData(data))
		let tableB = await this._readRows(tables[1]).then(data => this._rowsData(data))
		let tableC = await this._readRows(tables[2]).then(data => this._rowsData(data))
		
		console.log(' _selectTablesData =>', tableA, tableB, tableC)

		return [tableA, tableB, tableC]
	}
	async _getTableAccess(titles,link){
	
		let info = await this._getAccess(link);
	
		return await this._selectTables(titles, info)
	}

	async _setCTable(titles, link){
		let tables = await this._getTableAccess(titles,link)
		
		await this._setHeaderRow(tables[0])
		await this._setHeaderRow(tables[1])
		await this._setHeaderRow(tables[2])
    	
		let tableA = await this._readRows(tables[0]).then(data => this._rowsData(data))
		let tableB = await this._readRows(tables[1]).then(data => this._rowsData(data))
		
		let rowC = await this._toOneTable({a:tableA, b:tableB})
		
		console.log(' _setCTable data to set => ',rowC)

		await this._setRows({rows:rowC, table:tables[2]})
		
		return await this._readRows(tables[2]).then(data => this._rowsData(data))	
	
	}

}
