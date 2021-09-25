import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
// import getWeb3 from './utils/getWeb3'
import getWeb3 from "/Users/chixinning/Desktop/Demo/client/src/getWeb3.js"
import ipfsAPI from "ipfs-api";

// animate
// import { StyleSheet, css } from 'aphrodite';
// import { spaceInLeft, spaceOutRight } from 'react-magic';

// import './css/oswald.css'
// import './css/open-sans.css'
// import './css/pure-min.css'
import './App.css'


const ipfs = ipfsAPI('localhost', '5004', {protocol: 'http'});

// animate style
// const styles = StyleSheet.create({
//     in: {
//         animationName: spaceInLeft,
//         animationDuration: '10s'
//     },
//     out: {
//         animationName: spaceOutRight,
//         animationDuration: '10s'
//     }
// });

// const contractAddress = "0xb3e2957f9aa802a6287ef067e91d76eada7d6322" // 合约地址
// 0xE2E0d74AE26218b750273925C4Bf4aA474bd5779 
// 0x4368fA318CBBdd50bCa27d096728550628913492
const contractAddress = "0xFEB1ba69eF45D88Ea14307fb998d96a0f93E4161"
var simpleStorageInstance // 合约实例

let saveImageOnIpfs = (reader) => {
	return new Promise(function (resolve, reject) {
			const buffer = Buffer.from(reader.result);
			ipfs.add(buffer).then((response) => {
					console.log(response);
					resolve(response[0].hash);
			}).catch((err) => {
					console.error(err);
					reject(err);
			})  
	})  
}

class App extends Component {

	// state = { 
	// 	web3: null,
	// 	accounts: null,
	// 	contract: null,
	// 	hash: "", 
	// 	writeOK: false,
	// 	response: "", 
	// };  
	

	constructor(props) {
		super(props)
		this.state = {
            word: null,
            from: null,
            timestamp: null,
			random: 0,
			count: 0,
			input: '',
			hash: '', 
			writeOK: false,
			response: "", 
            web3: null,
            emptyTip: "还没有留言，快来创建全世界第一条留言吧~",
            firstTimeLoad: true,
            loading: false,
            loadingTip: "留言写入所需时间不等（10s~5min），请耐心等待~",
            waitingTip: "留言写入所需时间不等（10s~5min），请耐心等待~",
            successTip: "留言成功",
            animate: "",
            // in: css(styles.in),
            // out: css(styles.out)
		}
	}

	componentWillMount() {
		getWeb3
		.then(results => {
			this.setState({
				web3: results.web3
			})
			this.instantiateContract()
		})
		.catch(() => {
			console.log('Error finding web3.')
		})
	}

    // 循环从区块上随机读取留言
	randerWord() {
        const that = this
		setInterval(() => {
			let random_num = Math.random() * (this.state.count? this.state.count: 0)
			this.setState({
				random: parseInt(random_num)
			})
			console.log("setInterval读取", this.state.random)
			simpleStorageInstance.getRandomWord(this.state.random)
			.then(result => {
                console.log("setInterval读取成功", result)
                if(result[1]!=this.setState.word){
                    // this.setState({
                    //     animate: this.state.out
                    // })
                    setTimeout(() => {
                        that.setState({
                            count: result[0].c[0],
                            word: result[1],
                            from: result[2],
                            timestamp: result[3],
                            like:result[4],
                            // animate: this.state.in
                        })
                    }, 2000)
                }
			})
		}, 10000)
	}

	instantiateContract() {
        const that = this
		const contract = require('truffle-contract')
		const simpleStorage = contract(SimpleStorageContract)
		simpleStorage.setProvider(this.state.web3.currentProvider)

		// Get accounts.
		this.state.web3.eth.getAccounts((error, accounts) => {
			simpleStorage.at(contractAddress).then(instance => {
				simpleStorageInstance = instance
				//console.log("合约实例获取成功")
			})
			.then(result => {
				return simpleStorageInstance.getRandomWord(this.state.random)
			})
			.then(result => {
                //console.log("读取成功", result)
                if(result[1]!=this.setState.word){
                    // this.setState({
                    //     animate: this.state.out
                    // })
                    setTimeout(() => {
                        that.setState({
                            count: result[0].c[0],
                            word: result[1],
                            from: result[2],
                            timestamp: result[3],
                            like:result[4],
                            // animate: this.state.in,
                            firstTimeLoad: false
                        })
                    }, 2000)
                }else{
                    this.setState({
                        firstTimeLoad: false
                    })
                }
				this.randerWord()
			})

		})
	}

  	render() {
		return (
			<div className="container">
				<header className="header">“以太坊区块链上永存的留言”</header>
				<main>
					<div className="main-container">
						<div className="showword">
                            <div className={this.state.magic}>
                                {
                                    (simpleStorageInstance && !this.state.firstTimeLoad)
                                    ? <span className={this.state.animate}>{this.state.word || this.state.emptyTip}</span>
                                    : <img src={require("../public/loading/loading-bubbles.svg")} width="64" height="64"/>
                                }
                            </div>
                            <p className="{this.state.animate}">
                                <button onClick={() => this.likeWord()}>点赞</button>
                                <span>{this.state.word? "来源："+this.state.from: ""}</span>
                                <span>{this.state.word? "时间："+this.formatTime(this.state.timestamp): ""}</span>
                                <span>{this.state.word? "点赞数："+this.state.like: ""}</span>
                            </p>
                            <p className="{this.state.animate}">
                                <button onClick={() => this.getTopThree()}>榜单</button>
                                <span>{this.state.word? "内容："+this.state.word: ""}</span>
                                <span>{this.state.word? "来源："+this.state.from: ""}</span>
                                <span>{this.state.word? "时间："+this.formatTime(this.state.timestamp): ""}</span>
                                <span>{this.state.word? "点赞数："+this.state.like: ""}</span>
                            </p>
                        </div>
						<div className="setword">
							<input type="text" value={this.state.input} onChange={e => this.inputWord(e)}/>
							<button onClick={() => this.setWord()}>写入</button>
						</div>
						<div className="tips">
							<div>
								<p>注意事项：</p>
								<ul>
									<li>浏览器需要安装 Matemask 扩展程序</li>
									<li>网络切换至 Ropoetn Test Network</li>
                                    <li>留言写入区块链时间不等(10s~5min)，请耐心等待</li>
                                    <li>留言为随机展示，每个人留言的展示机会平等</li>
								</ul>
							</div>
						</div>
						{/* 新增 */}
						<div>
                                <h2>请上传图片</h2>
                                <div>
                                        <input type='file' ref="fileid"/>
                                        <button onClick={() => this.upload(this.refs.fileid.files[0])}>点击我上传到ipfs
                                        </button>
                                        {
                                                this.state.hash && <h2>图片已经上传到ipfs: {this.state.hash}</h2>
                                        }
                                        {
                                                this.state.hash && <button onClick={() => this.saveHashToEth()}>点击我上传到以太坊</button>
                                        }
                                        {
                                                this.state.writeOK && <button onClick={() => this.getHashFromEth()}>点击我获取图片</button>
                                        }
                                        {
                                                this.state.response &&
                                                <div>
                                                        浏览器访问结果:{"http://localhost:8085/ipfs/" + this.state.response}                                           
                                                        <img src={"http://localhost:8085/ipfs/" + this.state.response}/>
                                                </div>
                                        }
                                </div>
                        </div>
					</div>
				</main>
				<footer>By <a href="https://www.ldsun.com" target="_blank">Ludis</a></footer>
                <div className={this.state.loading? "loading show": "loading"}>
                    <img src={require("../public/loading/loading-bubbles.svg")} width="128" height="128"/>
                    <p>Matemask 钱包确认支付后开始写入留言</p>
                    <p>{this.state.loadingTip}</p>
                </div>
			</div>
		);
	}
	inputWord(e){
		this.setState({
			input: e.target.value
		})
    }
    // 写入区块链
	setWord(){
        if(!this.state.input) return
        const that = this
        this.setState({
            loading: true
        })
		let timestamp = new Date().getTime()
		simpleStorageInstance.setWord(this.state.input, String(timestamp), {from: this.state.web3.eth.accounts[0]})
		.then(result => {
            this.setState({
                loadingTip: that.state.successTip
            })
            setTimeout(() => {
                that.setState({
                    loading: false,
                    input: '',
                    loadingTip: that.state.waitingTip
                })
            }, 1500)
			
        })
        .catch(e => {
            // 拒绝支付
            this.setState({
                loading: false
            })
        })
	}
    likeWord(){
        const that =this
        this.setState({
            loading: true
        })
        simpleStorageInstance.likeWord({from: this.state.web3.eth.accounts[0]})
        .then(result => {
            this.setState({
                // like: result[0],
                loadingTip: that.state.like
            })
            // setTimeout(() => {
            //     that.setState({
            //         loading: false,
            //         loadingTip: that.state.like
            //     })
            // }, 10000)
			
        })
        .catch(e => {
            // 拒绝支付
            this.setState({
                loading: false
            })
        })
        // this.setWord()
    }
    getTopThree(){
        const that = this
		setInterval(() => {
			let random_num = Math.random() * (this.state.count? this.state.count: 0)
			this.setState({
				random: parseInt(random_num)
			})
			console.log("setInterval读取", this.state.random)
			simpleStorageInstance.getRandomWord(this.state.random)
			.then(result => {
                console.log("setInterval读取成功", result)
                if(result[1]!=this.setState.word){
                    // this.setState({
                    //     animate: this.state.out
                    // })
                    setTimeout(() => {
                        that.setState({
                            count: result[0].c[0],
                            word: result[1],
                            from: result[2],
                            timestamp: result[3],
                            like:result[4],
                            // animate: this.state.in
                        })
                    }, 2000)
                }
			})
		}, 10000)
    }
    // 时间戳转义
    formatTime(timestamp) {
        let date = new Date(Number(timestamp))
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hour = date.getHours()
        let minute = date.getMinutes()
        let second = date.getSeconds()
        let fDate = [year, month, day, ].map(this.formatNumber)
        return fDate[0] + '年' + fDate[1] + '月' + fDate[2] + '日' + ' ' + [hour, minute, second].map(this.formatNumber).join(':') 
    }
    /** 小于10的数字前面加0 */
    formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }

	componentDidMount = async () => {
		try {
				const web3 = await getWeb3();
				const accounts = await web3.eth.getAccounts();
				const networkId = await web3.eth.net.getId();
				const deployedNetwork = SimpleStorageContract.networks[networkId];
				const instance = new web3.eth.Contract(
						SimpleStorageContract.abi,
						deployedNetwork && deployedNetwork.address,
				);  
				this.setState({ web3, accounts, contract: instance }); 
		} catch (error) {
				alert(
						`Failed to load web3, accounts, or contract. Check console for details.`,
				);  
				console.error(error);
		}   
	};  

	// upload = async (info) => {
	// 		console.log("info", info)
	// 		let reader = new FileReader()
	// 		reader.readAsArrayBuffer(info)
	// 		console.log("reader", reader)
	// 		console.log("reader.result", reader.result) //null
	// 		reader.onloadend = () => {
	// 				console.log("reader", reader)
	// 				console.log("reader.result", reader.result)
	// 				saveImageOnIpfs(reader).then((hash) => {
	// 						console.log("hash", hash)
	// 						this.setState({hash})
	// 				})
	// 		}
	// };

	// saveHashToEth = async () => {
	// 		let {contract, hash, accounts} = this.state;
	// 		try {
	// 				await contract.methods.setStoredData(hash).send({from: accounts[0]});
	// 				console.log('writeOK:', true)
	// 				this.setState({writeOK: true})
	// 		}
	// 		catch(e) {
	// 				console.log(e)
	// 				this.setState({writeOK: false})
	// 				console.log('writeOK :', false)
	// 		}
	// }

	// getHashFromEth = async () => {
	// 		let {contract} = this.state
	// 		try {
	// 				let response = await contract.methods.getStoredData().call();
	// 				console.log('response:', response)
	// 				this.setState({response})
	// 		}
	// 		catch (e) {
	// 				console.log(e)
	// 		}
	// }	
}

export default App
