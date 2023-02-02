import Moralis from "moralis/.";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
    const { enableWeb3, isWeb3Enabled, Moralis, deactivateWeb3, account, isWeb3EnableLoading } =
        useMoralis();
    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3();
        }
    }, [isWeb3Enabled]);
    useEffect(() => {
        Moralis.onAccountChanged((newAccount) => {
            console.log(`Account changed to ${newAccount}`);
            if (newAccount == null) {
                window.localStorage.removeItem("connected");
                deactivateWeb3();
                console.log("Null Account found");
            }
        });
    }, []);
    return (
        <>
            <nav>
                <ul>
                    <li className="flex flex-row">
                        {account ? (
                            <div className="ml-auto py-2 px-4">
                                Connected to {account.slice(0, 6)}...
                                {account.slice(account.length - 4)}
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    const ret = await enableWeb3();
                                    if (
                                        typeof ret !== "undefined" &&
                                        typeof window !== "undefined"
                                    ) {
                                        // if ()
                                        window.localStorage.setItem("connected", "injected");
                                    }
                                }}
                                disabled={isWeb3EnableLoading}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                            >
                                Connect
                            </button>
                        )}
                    </li>
                </ul>
            </nav>
        </>
    );
}
