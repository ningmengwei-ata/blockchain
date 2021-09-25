// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;




contract SimpleStorage {
    struct Message {
        string word; // 留言
        address from; // 留言者地址
        string timestamp; // 留言unix时间戳
        // string imageLink;//图片Hash
        uint256 like; //点赞数
    }

    Message[] private wordArr;
    Message[] private topThree;

    // mapping(address => uint) public writerId;
    // uint id = 0;

    function setWord(string memory s, string memory t) public {
        wordArr.push(
            Message({word: s, from: msg.sender, timestamp: t, like: 0})
        );
        /* writerId[id] = msg.sender; */
        /* id=id+1; */
    }

    function likeWord() public {
        // Message storage message = writerId[msg.sender];
        // message.like = message.like + 1;
        Message memory message;
        for (uint256 i = 0; i < wordArr.length; i++) {
            if (wordArr[i].from == msg.sender) {
                wordArr[i].like = wordArr[i].like + 1;
                message = wordArr[i];
            }
        }
        if (topThree.length < 3) {
            topThree.push(message);
        } else {
            uint256 min = topThree[0].like;
            uint256 k = 0;
            for (uint256 j = 1; j < 3; j++) {
                if (min > topThree[j].like) {
                    min = topThree[j].like;
                    k = j;
                }
            }
            if (message.like > min) {
                topThree[k] = message;
            }
        }
        // writerId[msg.sender].like = writerId[msg.sender].like + 1;
        // writerId[msg.sender].like = i;
        // return writerId[msg.sender].like;
    }

    function getRandomWord(uint256 random)
        public
        view
        returns (
            uint256,
            string memory,
            address,
            string memory,
            uint256
        )
    {
        if (wordArr.length == 0) {
            return (0, "", msg.sender, "", 0);
        } else {
            Message storage result = wordArr[random];
            return (
                wordArr.length,
                result.word,
                result.from,
                result.timestamp,
                result.like
            );
        }
    }

    function getTopThree(uint256 random)
        public
        returns (
            uint256,
            string memory,
            address,
            string memory,
            uint256
        )
    {
        if (topThree.length == 0) {
            return (0, "", msg.sender, "", 0);
        } else {
            Message storage top = topThree[random];
            return (
                topThree.length,
                top.word,
                top.from,
                top.timestamp,
                top.like
            );
        }
        // string memory first;
        // string memory second;
        // string memory third;
        // if(topThree.length==0){
        //     first = "";
        //     second = "";
        //     third = "";
        // }else if(topThree.length==1){
        //     first = topThree[0].word;
        //     second = "";
        //     third = "";
        // }else if(topThree.length==2){
        //     first = topThree[0].word;
        //     second = topThree[1].word;
        //     third = "";
        // }else{
        //     first = topThree[0].word;
        //     second = topThree[1].word;
        //     third = topThree[2].word;
        // }

        // return (first,second,third);
    }

    string storedData;

    function set(string memory x) public {
        storedData = x;
    }

    function get() public view returns (string memory) {
        return storedData;
    }
}
