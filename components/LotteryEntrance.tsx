import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddress } from "../constants";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import { useNotification } from "@web3uikit/core";
// import {NotificationProvider} from "@web3uikit/web3"
interface IContractAddresses {
    [key: string]: string[];
}

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();

    // console.log(isWeb3Enabled, "isWeb3Enabled");

    // console.log(chainIdHex, "chainIdHex");

    const chainId = parseInt(chainIdHex!).toString();
    const address: IContractAddresses = contractAddress;
    // console.log(address, "address");
    // console.log(chainId, "chainId");
    const dispatch = useNotification();
    const raffleAddress = chainId in address ? address[chainId!][0] : undefined;
    // console.log(raffleAddress, "raffleAddress");
    let [entranceFee, setEntranceFee] = useState("0");
    let [numPlayers, setNumPlayers] = useState("0");
    let [recentWinner, setRecentWinner] = useState("0");
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUI() {
        if (isWeb3Enabled) {
            // console.log(await getEntranceFee(), "1");

            const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString();
            setEntranceFee(entranceFeeFromCall);
            const numPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString();
            setNumPlayers(numPlayersFromCall);
            const recentWinner = ((await getRecentWinner()) as BigNumber).toString();
            setRecentWinner(recentWinner);
        }
    }
    useEffect(() => {
        updateUI();
    }, [isWeb3Enabled]);
    const handleSuccess = async (tx: ContractTransaction) => {
        await tx.wait(1);
        handleNewNotification();
        updateUI();
        // console.log("成功");
    };
    const handleNewNotification = async () => {
        dispatch({
            type: "success",
            message: "交易完成",
            title: "Tx Notification(交易通知)",
            position: "topR",
            // icon: "bell",
        });
    };
    return (
        <>
            <div>Hi from lottery entrance!</div>
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded ml-auto"
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                                onError: (err) => console.log(err),
                            });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
                    <p>Number Of Players: {numPlayers}</p>
                    <p>Recent Winner {recentWinner}</p>
                    {/* <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p> */}
                </div>
            ) : (
                <p>No Raffle Address Detected</p>
            )}
        </>
    );
}
