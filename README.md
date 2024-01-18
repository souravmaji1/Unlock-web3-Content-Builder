'use client'
// Assuming your dependencies are imported here
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';


function MetaMaskComponent() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('Not Connected');
  const [error, setError] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [abi, setAbi] = useState([]);
  const [writeFunctions, setWriteFunctions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [functionInputs, setFunctionInputs] = useState({});

  useEffect(() => {
    if (contractAddress && abi.length > 0) {
      const contract = new ethers.Contract(contractAddress, abi);
      const writeFunctions = contract.interface.fragments
        .filter((fragment) => fragment.type === 'function' && fragment.stateMutability !== 'view')
        .map((fragment) => fragment.name);

      setWriteFunctions(writeFunctions);
    }
  }, [contractAddress, abi]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setStatus('Not Connected');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      setStatus('Connected');
    }
  };

  const claimAirdrop = async () => {
    if (!contractAddress || abi.length === 0) {
      setError('Contract address and ABI are required.');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (!provider) return;

    const contract = new ethers.Contract(contractAddress, abi, provider.getSigner());

    try {
      if (!selectedFunction) {
        setError('Please select a function to call.');
        return;
      }

      const selectedFunctionFragment = abi.find(
        (fragment) => fragment.type === 'function' && fragment.name === selectedFunction
      );

      const inputs = selectedFunctionFragment.inputs || [];
      const args = inputs.map((input) => functionInputs[input.name]);

      const tx = await contract[selectedFunction](...args);
      await tx.wait();

      console.log(`Function ${selectedFunction} called successfully!`);
    } catch (error) {
      setError(error.reason || error.message);
      console.error(`Error calling function ${selectedFunction}:`, error.message);
    }
  };

  

  return (
    <div>
      <h1>MetaMask Account</h1>
      <p>Status: {status}</p>
      <p>Address: {account}</p>

      {status === 'Connected' && (
        <>
          <div>
            <label>Contract Address:</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
          </div>
          <div>
            <label>ABI:</label>
            <textarea
              value={JSON.stringify(abi, null, 2)}
              onChange={(e) => setAbi(JSON.parse(e.target.value))}
            />
          </div>

          {writeFunctions.length > 0 && (
            <div>
              <label>Select Function:</label>
              <select onChange={(e) => setSelectedFunction(e.target.value)}>
                <option value="">Select a function</option>
                {writeFunctions.map((func) => (
                  <option key={func} value={func}>
                    {func}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedFunction && (
            <div>
              <h3>Function Inputs:</h3>
              {abi
                .find((fragment) => fragment.name === selectedFunction)
                .inputs.map((input) => (
                  <div key={input.name}>
                    <label>{input.name}:</label>
                    <input
                      type="text"
                      value={functionInputs[input.name] || ''}
                      onChange={(e) =>
                        setFunctionInputs({
                          ...functionInputs,
                          [input.name]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
            </div>
          )}

          <button onClick={claimAirdrop}>Call Selected Function</button>
          {error && <p>Error: {error}</p>}
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </>
      )}

      {status !== 'Connected' && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default MetaMaskComponent;