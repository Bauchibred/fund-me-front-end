import { ethers } from "./ethers-5.6.esm.min.js" //we wennt to the ethers documentary and downloade their front endified code haha, saved it to a file then we imported it to this file so we can access ethers here, in future versions though we are just going to use yarn add ethers, cause working with react and the rest the frameworks automatically transforms these to their front end versions
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect //here we are telling jscript that when we click it we want to connect the wallet
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
  //we wrapped it up in an async function casue originally once we open our site the request to connect just pops up which is not really nice
  if (typeof window.ethereum !== "undefined") {
    //here we are checking if we have a mmask account connected to our site
    try {
      await ethereum.request({ method: "eth_requestAccounts" }) //connect the wallet, and when we add this and we reload our website we get the let's connect automatically
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected" //this is to show our users that it's been connected
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask" //and here we just inform the client that the connecttion could not go through and they should check to see if metamask is installed
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    //this line is permanent for all functions haha cause we need to have a wallet connected
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum) //wweb3provider an object in ethers that allows us to wrap around stuff in metamask, and this is similar to jpcrsonprovider
    const signer = provider.getSigner() //since we already have our web3provider connected to our metamask, we can run this line to directly get the wallet
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    } // the try catch here is just so jscript does not get lost on what to do if it encounters a problem, so meaning jscript tries to run what we want and if it encounters an error, it console logs this error
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.utils.formatEther(balance)) //used to make reading ethers formatted numbers much easy
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  // this function is for us to listen for when our tx goes through so we can inform user
  console.log(`Mining ${transactionResponse.hash}...`) //all transaction responses have hashes so this just represent the hash9
  return new Promise((resolve, reject) => {
    //we are using a promise here cause we want tthe function to wait the needed time, i.e we want to  use like the event loop,so the promise gets passed functions in the parentheses, i.e resolve and reject so we can put in a time out error in the future under the reject but for now no need
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      ) //provider.once syntax is from the ethers documentation and it's used to listen to a particular events for when it's called adn .once means we only care one time, and since we've listened and continue with the code once the transaction response finished we can now use it and consolelog it
      resolve() //so this measn only resolve once the transaction hash is found
    })
  })
}
