const path = require("path");
const HDWalletProvider = require("truffle-hdwallet-provider")
// var HDWalletProvider = require("truffle-hdwallet-provider");  // 导入模块
var mnemonic = "ranch dignity vendor news dutch guide web south grit develop monster excite";  //MetaMask的助记词。 

module.exports = {
        // See <http://truffleframework.com/docs/advanced/configuration>
        // to customize your Truffle configuration!
        contracts_build_directory: path.join(__dirname, "client/src/contracts"),

        networks: {
                ropsten: {
                        provider: function () {
                                
                                return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/7041b82d1d9a4c3798fb03f2929be3d0", 0, 3);
                        },
                        network_id: "*",  // match any network
                        gas: 3012388,
                        gasPrice: 30000000000
                },
              
        }
};
