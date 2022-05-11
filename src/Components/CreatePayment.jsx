import React, { useState, useEffect } from 'react';
import './CreatePayment.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BN from 'big.js';
import * as nearAPI from 'near-api-js';

export default function CreatePayment() {
    const { connect, keyStores, transactions, keyPair } = nearAPI;
    const ONE_NEAR = new BN("1000000000000000000000000");
    const [streamData, setStreamData] = useState({
        sender: '',
        receiver: '',
        amount: 0,
        deposit: 0,
        date: new Date(),
        comment: ''
    })
    const [main, setMain] = useState(1);
    const [balance, setBalance] = useState(0);
    const [url, setUrl] = useState('');

      useEffect(async () => {
          const newUrl = new URL(window.location.href);
          setStreamData({
                ...streamData,
                sender: newUrl.searchParams.get('sender'),
                receiver: newUrl.searchParams.get('receiver'),
                amount: newUrl.searchParams.get('amount'),
          })
      }, [])

    const accountValidity = async (near) => {
        await near.connection.provider.query({
          request_type: "view_account",
          finality: "final",
          account_id: streamData.receiver,
        })
        .catch(() => {
          alert(`Account ${streamData.receiver} does not exist`);
        //   window.location.reload();
        })
  
    }

    const updateStreamData = () => {
        const sender = streamData.sender;
        const receiver = document.getElementById('receiver');
        const amount = document.getElementById('amount');
        const date = document.getElementById('endDate');
        const comment = document.getElementById('comment');

        setStreamData({
            sender: sender.value ? sender.value : '',
            receiver: receiver.value  ? receiver.value : '',
            amount: amount.value ? amount.value : 0,
            date: date.value ? date.value : new Date(),
            comment: comment.value ? comment.value : '',
        })
    }

    const tokensPerSecond = (date, amount) => {
        console.log(new Date(), date.getHours())
        const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        console.log(seconds)
        const tokens_per_second = amount.div(seconds);
        return tokens_per_second;
    }
    
    const makeDeposit = async () => {
        if (!window.accountId) {
            alert('Please login');
            return;
        }

        if (streamData.deposit === 0) {
            alert('Please enter a valid deposit amount');
        }
        const streamAmount = new BN(streamData.deposit);
        const amount = streamAmount.times(ONE_NEAR);
        await window.contract.near_deposit(
            {},
            200000000000000,
            amount.toFixed(),
        );}

    const startStream = async () => {
        console.log(streamData);
        if (streamData.receiver === '') {
            alert('Please enter a receiver ID');
            return;
        }
        if (streamData.amount === 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (streamData.date === '') {
            alert('Please enter a valid date');
            return;
        }

        const keyStore = new keyStores.BrowserLocalStorageKeyStore();
        const nearConfig = {
            networkId: "testnet",
            keyStore, 
            nodeUrl: "https://rpc.testnet.near.org",
            walletUrl: "https://wallet.testnet.near.org",
            helperUrl: "https://helper.testnet.near.org",
            explorerUrl: "https://explorer.testnet.near.org",
          }
        const near = await connect({ ...nearConfig, keyStore });
        await accountValidity(near);

        const streamAmount = new BN(streamData.amount);
        const amount = streamAmount.times(ONE_NEAR);
        const tokens_per_second = tokensPerSecond(streamData.date, amount);
        console.log(window.walletConnection.requestSignTransactions);

        const account = await near.account('wrap.testnet');
        console.log(transactions, account);
        // await window.walletConnection.requestSignTransactions({
        //     transactions: [

        //     ]
        //     transactions: [
        //         transactions.createTransaction ({
        //             signerId: window.accountId,
        //         receiverId: 'wrap.testnet',
        //         actions: [
        //             {
        //                 type: 'FunctionCall',
        //                 params: {
        //                     methodName: 'near_deposit',
        //                     args: {},
        //                     gas: 200000000000000,
        //                     deposit: amount.toString()
        //                 }
        //             },
        //             {
        //                 type: 'FunctionCall',
        //                 params: {
        //                     methodName: 'ft_transfer_call',
        //                     args: {
        //                         receiver_id: 'streaming-r-v2.dcversus.testnet',
        //                         amount: amount.toFixed(), // 1 NEAR
        //                         memo: 'Roketo transfer',
        //                         msg: JSON.stringify({
        //                             Create: {
        //                                 request: {
        //                                     "owner_id": window.accountId,
        //                                     "receiver_id": streamData.receiver,
        //                                     "tokens_per_sec": tokens_per_second, 
        //                                     "is_auto_start_enabled": true,
        //                                 }
        //                             },
        //                         }),
        //                     },
        //                     gas: 200000000000000,
        //                     deposit: 1
        //                 }
        //             }
        //         ]
        //     })]
        // })

        await window.contract.ft_transfer_call({
            receiver_id: 'streaming-r-v2.dcversus.testnet',
            amount: amount.toFixed(), 
            memo: 'Roketo transfer',
            msg: JSON.stringify({
                Create: {
                    request: {
                        "owner_id": window.accountId,
                        "receiver_id": streamData.receiver,
                        "tokens_per_sec": tokens_per_second, 
                        "is_auto_start_enabled": true,
                        "description": streamData.comment,
                        "token_name": "wrap.testnet"
                    }
                },
            }),
        }, 
        200000000000000, 
        1,
        );
    }

    const linkGenerator = () => {
        if (streamData.sender === '' || streamData.receiver === '' || streamData.amount === 0 || streamData.date === '') {
            alert('Please fill all fields');
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('sender', streamData.sender);
        url.searchParams.set('receiver', streamData.receiver);
        url.searchParams.set('amount', streamData.amount);
console.log(url.toString());
        setUrl(url.toString());

        return url.toString();
    }
   
    return (
        <>
            <div className="payment-menu" id="instant">
                <span onClick={() => {setMain(0)}}>Deposit</span>
                <span onClick={() => {setMain(1)}}>Individual</span>
                <span onClick={() => {setMain(2)}}>Freelancer</span>
                <span onClick={() => {setMain(3)}}>Company</span>
            </div>
            <div className="line"></div>
            {main === 0 && 
                <div className="company" id="company">
                    <h1 style={{textAlign: 'center'}}>Deposit</h1>
                    <p style={{textAlign: 'center'}}>You need to make deposits to create Stream.</p>
                    <div className="form">
                        <label>Deposit Amount:</label><br />
                        <input type="number" onChange={(e) => {setStreamData({...streamData, deposit: e.target.value})}} />
                        <button onClick={makeDeposit}>Deposit</button>
                    </div>
                </div>}
            {main === 1 &&     
                <div className="individual">
                    <h1 style={{textAlign: 'center'}}>Stream Payment</h1>
                    <p style={{textAlign: 'center'}}>Start sending payments to a freelancer in real-time.</p>
                    <div className="form">
                        <label>Receiver:</label><br />
                        <input type="text" value={streamData.receiver} placeholder="Enter receiver's account ID" id="receiver" onChange={updateStreamData} /><br />
                        <label>Stream initial deposit:</label><br />
                        <input type="text" value={streamData.amount} placeholder="Enter amount" id="amount" onChange={updateStreamData} /><br />
                        <label>End date:</label><br />
                        <DatePicker minDate={new Date()} id="endDate" onChange={updateStreamData} /><br />
                        <label>Comment:</label><br />
                        <textarea id="comment" name="Enter comment"></textarea><br />
                        <button onClick={startStream}>Create</button>
                    </div>
                </div>}
            {main === 2 && 
                <div className="freelancer" id="link">
                    <h1 style={{textAlign: 'center'}}>Generate Payment Link</h1>
                    <p style={{textAlign: 'center'}}>Receive payments from clients in real-time.</p>
                    <div className="form">
                        <label>Sender:</label><br />
                        <input type="text" placeholder="Enter sender's account ID" id="sender" onChange={(e) => {setStreamData({...streamData, sender: e.target.value})}} /><br />
                        <label>Receiver:</label><br />
                        <input type="text" placeholder="Enter receiver's account ID" id="receiver" onChange={(e) => {setStreamData({...streamData, receiver: e.target.value})}} /><br />
                        <label>Stream initial deposit:</label><br />
                        <input type="text" placeholder="Enter amount" id="amount" onChange={(e) => {setStreamData({...streamData, amount: e.target.value})}} /><br />
                        <button onClick={linkGenerator}>Generate</button>
                        {url &&
                         <button onClick={() => {
                                navigator.clipboard.writeText(url);
                         }} style={{marginTop: 10}}>Click to copy link</button>}
                    </div>
                </div>}
                {main === 3 && 
                <div className="company" id="company">
                    <h1 style={{textAlign: 'center'}}>Automate Staff Payroll</h1>
                    <p style={{textAlign: 'center', color: 'red'}}>This feature is not available at the moment.</p>
                    
                </div>}
        </>
    )
}