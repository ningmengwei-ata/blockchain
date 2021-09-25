import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3.js";
// import getWeb3 from "./utils/getWeb3"
import ipfsAPI from "ipfs-api";
const ipfs = ipfsAPI('localhost', '5004', { protocol: 'http' });
// animate
import { StyleSheet, css } from 'aphrodite';
import { spaceInLeft, spaceOutRight } from 'react-magic';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

// animate style
const styles = StyleSheet.create({
    in: {
        animationName: spaceInLeft,
        animationDuration: '10s'
    },
    out: {
        animationName: spaceOutRight,
        animationDuration: '30s'
    }
});
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
var simpleStorageInstance
var contractAddress="0x092B26c0728401602e63db8A22379d715907FF6e"
class App extends Component {
    state = {
        web3: null,
        accounts: null,
        contract: null,
        hash: "",
        writeOK: false,
        response: "",
        word: "Hello Ether!",
        from: null,
        timestamp: null,
        random: 0,
        count: 0,
        input: '',
        like: 0,
        emptyTip: "还没有留言，快来创建全世界第一条留言吧~",
        firstTimeLoad: true,
        loading: false,
        loadingTip: "留言写入所需时间不等（10s~5min），请耐心等待~",
        waitingTip: "留言写入所需时间不等（10s~5min），请耐心等待~",
        successTip: "留言成功",
    };

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
            this.randomWord();
            console.log("deployedNetwork.address",deployedNetwork.address)
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };
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
                    if (result[1] != this.setState.word) {
                        this.setState({
                            animate: this.state.out
                        })
                        setTimeout(() => {
                            that.setState({
                                count: result[0].c[0],
                                word: result[1],
                                from: result[2],
                                timestamp: result[3],
                                like: result[4],
                                animate: this.state.in,
                                firstTimeLoad: false
                            })
                        }, 2000)
                    } else {
                        this.setState({
                            firstTimeLoad: false
                        })
                    }
                    this.randerWord()
                })

        })
    }
    // 循环从区块上随机读取留言
    randomWord = async () => {
        let { contract, word } = this.state;
        let random_num = Math.random() * (this.state.count ? this.state.count : 0)

        this.setState({ random: parseInt(random_num) })
        try {
            let res = await contract.methods.getRandomWord(random_num).call()
            console.log("res: ", res)
            if (res[1] != word) {
                this.setState({
                    count: res[0].c[0],
                    word: res[1],
                    from: res[2],
                    timestamp: res[3],
                    like: res[4]
                })
            }
        }
        catch (e) {
            console.log("randomWordERROR!", e)
        }



    }

    upload = async (info) => {
        console.log("info", info)
        let reader = new FileReader()
        reader.readAsArrayBuffer(info)
        console.log("reader", reader)
        console.log("reader.result", reader.result) //null
        reader.onloadend = () => {
            console.log("reader", reader)
            console.log("reader.result", reader.result)
            saveImageOnIpfs(reader).then((hash) => {
                console.log("hash", hash)
                this.setState({ hash })
            })
        }
    };

    saveHashToEth = async () => {
        let { contract, hash, accounts } = this.state;
        try {
            let res=await contract.methods.set(hash).send({ from: accounts[0] });
            console.log('writeOK:', true)
            this.setState({ writeOK: true })
            console.log("saveHashToEth ",res)
        }
        catch (e) {
            console.log(e)
            this.setState({ writeOK: false })
            console.log('writeOK :', false)
        }
    }

    getHashFromEth = async () => {
        let { contract } = this.state
        try {
            let response = await contract.methods.get().call();
            console.log('response:', response)
            // console.log("saveHashToEth ",response)
            this.setState({ response })
        }
        catch (e) {
            console.log(e)
        }
    }
    inputWord(e) {
        this.setState({
            input: e.target.value
        })
    }
    // 写入区块链
    setWord = async () => {
        if (!this.state.input) return
        this.setState({
            loading: true
        })
        let { contract, accounts } = this.state
        let timestamp = new Date().getTime()
        try {
            console.log("SETWORDthis.state.input,",this.state.input)
            let res = await contract.methods.setWord(this.state.input, String(timestamp)).send({ from: accounts[0] })
            console.log("res: ", res)
            this.setState({
                loadingTip: this.state.successTip
            })
            setTimeout(() => {
                this.setState({
                    loading: false,
                    input: '',
                    loadingTip: this.state.waitingTip
                })
            }, 1500)

        } catch (e) {
            console.log("setWordERROR!", e)
            this.setState({
                loading: false
            })
        }
    }
    likeWord = async () => {
        // const that=this
        this.setState({
            loading: true
        })
        let { contract, accounts } = this.state
        try {
            let res = await contract.methods.likeWord({ from: accounts[0] })
            this.setState({
                loadingTip: this.state.like
            })

        } catch (e) {
            console.log("ERROR!", e)
            this.setState({
                loading: false
            })
        }
    }
    getTopThree = async () => {
        // const that = this
        let { contract } = this.state
        setInterval(() => {
            let random_num = Math.random() * (this.state.count ? this.state.count : 0)
            this.setState({
                random: parseInt(random_num)
            })
            console.log("setInterval读取", this.state.random)
            try {
                let res = contract.methods.getRandomWord(this.state.random)
                console.log("setInterval读取成功", res)
                if (res[1] != this.setState.word) {
                    // this.setState({
                    //     animate: this.state.out
                    // })
                    setTimeout(() => {
                        this.setState({
                            count: res[0].c[0],
                            word: res[1],
                            from: res[2],
                            timestamp: res[3],
                            like: res[4],
                            // animate: this.state.in
                        })
                    }, 2000)
                }

            } catch (e) {
                console.log("ERROR!", e)
                this.setState({
                    loading: false
                })
            }
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
        let fDate = [year, month, day,].map(this.formatNumber)
        return fDate[0] + '年' + fDate[1] + '月' + fDate[2] + '日' + ' ' + [hour, minute, second].map(this.formatNumber).join(':')
    }
    /** 小于10的数字前面加0 */
    formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }
    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        let { hash, writeOK, response } = this.state
        return (
            
            <div className="container">
                <header className="header">毕业留言版
                </header>

                <h2>请上传图片</h2>
                <div >
                    <span>{"随机留言" + this.state.word}</span>
                </div>
                <div>
                    <input type='file' ref="fileid" />
                    <button onClick={() => this.upload(this.refs.fileid.files[0])}>点击我上传到ipfs
                    </button>
                    {
                        hash && <h2>图片已经上传到ipfs: {hash}</h2>
                    }
                    {
                        hash && <button onClick={() => this.saveHashToEth()}>点击我上传到以太坊</button>
                    }
                    {
                        writeOK && <button onClick={() => this.getHashFromEth()}>点击我获取图片</button>
                    }
                    {
                        response &&
                        <div>
                            浏览器访问结果:{"http://localhost:8085/ipfs/" + response}
                            <img src={"http://localhost:8085/ipfs/" + response} />
                        </div>
                    }
                </div>
                
						<div className="showword">
                        <div className={this.state.magic}>
                                {
                                    (simpleStorageInstance && !this.state.firstTimeLoad)
                                    ? <span className={this.state.animate}>{this.state.word || this.state.emptyTip}</span>
                                    : <img src={require("../public/loading/loading-bubbles.svg")} width="64" height="64"/>
                                }
                            </div>
                           
                          
                        </div>
						
                <p className="likeWord">
                    <button onClick={() => this.likeWord()}>点赞</button>
                    <span>{this.state.word ? "来源：" + this.state.from : ""}</span>
                    <span>{this.state.word ? "时间：" + this.formatTime(this.state.timestamp) : ""}</span>
                    <span>{this.state.word ? "点赞数：" + this.state.like : ""}</span>
                </p>
                <p className="getTopThree">
                <div className={this.state.magic}>
                                {
                                    (simpleStorageInstance && !this.state.firstTimeLoad)
                                    ? <span className={this.state.animate}>{this.state.word || this.state.emptyTip}</span>
                                    : <img src={require("../public/loading/loading-bubbles.svg")} width="64" height="64"/>
                                }
                            </div>
                    <button onClick={() => this.getTopThree()}>榜单</button>
                    <span>{this.state.word ? "内容：" + this.state.word : ""}</span>
                    <span>{this.state.word ? "来源：" + this.state.from : ""}</span>
                    <span>{this.state.word ? "时间：" + this.formatTime(this.state.timestamp) : ""}</span>
                    <span>{this.state.word ? "点赞数：" + this.state.like : ""}</span>
                </p>
                <div className="setword">
                    <input type="text" value={this.state.input} onChange={e => this.inputWord(e)} />
                    console.log("setword",{this.state.input})
                    <button onClick={() => this.setWord()}>写入</button>
                </div>

            </div>


        );
    }
}

export default App;
