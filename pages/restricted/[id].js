// pages/restricted/[id].js (for displaying restricted content)
'use client'
// pages/restricted/[id].js
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../abi.json';
import { Button, Typography, Container, Grid, Paper } from '@mui/material';
import { Days_One } from 'next/font/google'
import Image from 'next/image';


const daysone = Days_One({
  subsets: ['latin'],
  weight: '400'
});

const supabase = createClient('https://pvqugdjpqrkjucczgejw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cXVnZGpwcXJranVjY3pnZWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzOTI5MDQsImV4cCI6MjAyMDk2ODkwNH0.-j4fDwjSrAj2aJFkSJffYsL-g5XV28lwaj38ditYdy0');

export async function getServerSideProps(context) {
  const { params } = context;
  const { id } = params;

  try {
    const { data: collab } = await supabase
      .from('collab')
      .select('*')
      .eq('ids', id)
      .single(); // Use .single() to get a single row based on the id

    console.log(collab);

    if (!collab) {
      throw new Error('Data not found');
    }

    return {
      props: {
        data: collab,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    return {
      props: {
        data: null, // or any default value
      },
    };
  }
}


// ... (your imports remain the same)

const RestrictedPage = ({ data }) => {

  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('Not Connected');
  const [tokenBalance, setTokenBalance] = useState(0);
  

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
      checkTokenBalance(accounts[0]);
    }
  };

  const checkTokenBalance = async (userAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const erc20Contract = new ethers.Contract(data.nftContract, contractABI, signer);

    try {
      const balance = await erc20Contract.balanceOf(userAddress);
      const final = Number(balance);
      setTokenBalance(final);
      console.log('Token Balance:', final);

      // Display content if the user has tokens
      if (final > 0) {
        console.log('User has tokens. Displaying content:', data.content);
      } else {
        console.log('User does not have tokens. Better luck next time!');
      }
    } catch (error) {
      console.error('Error checking token balance:', error);
    }
  };

 


  const isVideo = data.format === 'video';
  const isImage = data.format === 'image';
  const isERC721 = data.option === 'erc721';
  const isERC20 = data.option === 'erc20';
  

  return (
    <Container maxWidth="lg" style={{ marginTop: '50px' }}>
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: '20px', textAlign: 'center',background:'black',border:'1px solid gray' }}>
          <Typography className={` ${daysone.className}`}  sx={{color:'white'}} variant="h4">MetaMask Account</Typography>
          <Typography sx={{color:'white'}} variant="subtitle1">Status: {status}</Typography>
          <Typography sx={{color:'white'}} variant="subtitle1">Address: {account}</Typography>
          
          {status !== 'Not Connected' && (
         <Button className={` ${daysone.className}`}  variant="contained"  onClick={disconnectWallet} style={{ margin: '20px 10px',background:'#ff9900',color:'black' }}>
        Disconnect Wallet
         </Button>
          )}
          {status !== 'Connected' && (
            <Button className={` ${daysone.className}`}   variant="contained"  onClick={connectWallet} style={{ margin: '20px 10px',background:'#ff9900',color:'black'  }}>
              Connect Wallet
            </Button>
          )}
        </Paper>
      </Grid>

   
      {tokenBalance > 0 ? (
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '20px', marginTop: '20px',background:'black',border:'1px solid gray' }}>
            <Typography className={` ${daysone.className}`}  sx={{color:'white'}} variant="h4">Content:</Typography>
            <Typography sx={{color:'white'}} variant="body1">{data.content}</Typography>
            {isVideo && (
                <video width="640" height="360" controls>
                  <source src={`https://ipfs.io/ipfs/${data.ipfsCid}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {isImage && (
                <Image src={`https://ipfs.io/ipfs/${data.ipfsCid}`} width={200} height={300} alt='' />
              )}
          </Paper>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', textAlign: 'center',background:'black',border:'1px solid gray' }}>
            <Typography className={` ${daysone.className}`}  sx={{color:'white'}} variant="subtitle1">User does not have ERC20 tokens. Better luck next time!</Typography>
          </Paper>
        </Grid>
      )}
  


    </Grid>
  </Container>
  );
};

export default RestrictedPage;
