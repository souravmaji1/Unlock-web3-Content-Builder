'use client'
// Import the Supabase client
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, Typography, Paper, Card, CardContent, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { Days_One } from 'next/font/google'


const daysone = Days_One({
  subsets: ['latin'],
  weight: '400'
});
// Initialize Supabase client with your Supabase project URL and API key
const supabase = createClient('https://pvqugdjpqrkjucczgejw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cXVnZGpwcXJranVjY3pnZWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzOTI5MDQsImV4cCI6MjAyMDk2ODkwNH0.-j4fDwjSrAj2aJFkSJffYsL-g5XV28lwaj38ditYdy0');

const AddNFTPage = () => {
  const [nftContract, setNftContract] = useState('');
  const [content, setContent] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
  
    // Determine file format based on file type
    let fileFormat = null;
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (fileType.startsWith('image/')) {
        fileFormat = 'image';
      } else if (fileType.startsWith('video/')) {
        fileFormat = 'video';
      } else if (fileType.startsWith('audio/')) {
        fileFormat = 'audio';
      }
    }
  
    // Set the file and format in state
    setFile(selectedFile);
    setSelectedFormat(fileFormat);
  };
  

  const handleSave = async () => {
    setLoading(true);
    const uniqueId = uuidv4();

    // Upload file to IPFS
    let ipfsCid = null;
    if (file) {
      ipfsCid = await uploadFileToIPFS(file);
    }

    // Save data to Supabase
    const { error } = await supabase.from('collab').insert([
      {
        ids: uniqueId,
        nftContract,
        content,
        ipfsCid, // Store IPFS CID in Supabase
        format: selectedFormat, // Add selected format to Supabase
        option: selectedOption, // Add selected option to Supabase
      },
    ]);

    const { data: collab } = await supabase.from('collab').select('*');
    console.log(collab);
    setLoading(false);
    

    if (error) {
      console.error('Error saving data to Supabase:', error.message);
      return;
    }

    // Generate link to the restricted page
    const generatedLink = `${window.location.origin}/restricted/${uniqueId}`;

    // Update state to display the generated link
    setGeneratedLink(generatedLink);
  };

  const uploadFileToIPFS = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
      name: 'Uploaded File',
    });
    formData.append('pinataMetadata', pinataMetadata);

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMDE0NGNiNi1hMWI4LTQwYjgtYWM5My03ZGQ5ZTA1ZWRiZTciLCJlbWFpbCI6Im1hamlzb3VyYXYyNTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijk2MGJlMmMwYjI0MGU3MDQxMmUzIiwic2NvcGVkS2V5U2VjcmV0IjoiYjkyZDJlNzRlNjM1MWY5ZmIyODM0NTY2MDk2YmQxZjI4YTNhMjA5OTA4Zjk5ZmQwMjU3NTYzYmQxZTRkZmVmNyIsImlhdCI6MTcwNTQ2OTY0Mn0.v4AYyTIW5QU1q6XtQq8IoCfjRsyLxdAgoj604FoQY_k`,
        },
      });
      console.log(res.data);
      setLoading(false);
      return res.data.IpfsHash;
    } catch (error) {
      console.log(error);
      setLoading(false);
      return null;
    }
  };

  return (
    <Paper elevation={3} style={{ padding: 20, margin: 'auto',background:'black',border:'1px solid gray' }}>
   
   
      <Typography variant="h7" gutterBottom sx={{ color: 'white' }} className={` ${daysone.className}`}>
        SELECT CONTRACT FORMAT
      </Typography>

      <RadioGroup value={selectedOption} onChange={handleOptionChange} sx={{marginBottom:'25px',marginTop:'15px'}} >
        <Card sx={{ background: 'gray', borderRadius: '7px', marginBottom: '15px' }}>
          <CardContent>
            <FormControlLabel
              value="erc721"
              control={<Radio />}
              label={<Typography sx={{ color: 'black',fontFamily:'__Days_One_cad049' }}>ERC721 - COMING SOON</Typography>}
              
            />
            {/* Add additional content for Format 1 if needed */}
          </CardContent>
        </Card>

        <Card sx={{ background: 'gray', borderRadius: '7px' }}>
          <CardContent>
            <FormControlLabel
              value="erc20"
              control={<Radio />}
              label={<Typography sx={{ color: 'black',fontFamily:'__Days_One_cad049' }}>ERC20</Typography>}
           
            />
            {/* Add additional content for Format 2 if needed */}
          </CardContent>
        </Card>
      </RadioGroup>


    <Typography variant="h7" gutterBottom sx={{color:'white'}} className={` ${daysone.className}`}  >
      ADD CONTRACT ADDRESS
    </Typography>

    <TextField
      variant="outlined"
      sx={{background:'gray',borderRadius:'7px'}}
      fullWidth
      margin="normal"
      value={nftContract}
      onChange={(e) => setNftContract(e.target.value)}
    />
    <br></br>
    <br></br>
<Typography variant="h7" gutterBottom sx={{color:'white'}} className={` ${daysone.className}`}  >
      ADD PROJECT NAME
    </Typography>
    <TextField
      variant="outlined"
      fullWidth
      sx={{background:'gray',marginBottom:'15px',borderRadius:'7px'}}
      multiline
      rows={4}
      margin="normal"
      value={content}
      onChange={(e) => setContent(e.target.value)}
    />
   
    <Typography  sx={{color:'white',fontFamily:'__Days_One_cad049'}}  >
        UPLOAD YOUR FILE
    </Typography>
    
    <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <input
    id="fileInput"
    type="file"
    accept="video/*,audio/*,image/*"
    onChange={handleFileChange}
    style={{ display: 'none' }}
  />
  <Button
    component="span"
    sx={{
      marginTop: '10px',
      background: '#ff9900',
      color: 'black',
      fontFamily: '__Days_One_cad049',
      '&:hover': {
        background: '#ff8800', // darker shade on hover
      },
    }}
  >
    Upload File
  </Button>
</label>

<br></br>
<br></br>

    <Button   sx={{margin:'auto',display:'flex',width:'100%',background:"#ff9900",color:'black',fontFamily:'__Days_One_cad049'}}  color="primary"   onClick={handleSave}>
      Save
    </Button>

    {loading && <p style={{color:'white'}}>Loading...</p>}

    {generatedLink && (
      <div style={{ marginTop: 20 }}>
        <Typography variant="body1" gutterBottom sx={{color:'white'}} className={` ${daysone.className}`}  >
          Generated Link:
        </Typography>
        <pre style={{ color: '#ffffff', background: 'gray', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
        <a href={generatedLink} target="_blank" rel="noopener noreferrer" style={{color:'white'}}>
          {generatedLink}
        </a>
        </pre>
        
      </div>
    )}
  </Paper>
  );
};

export default AddNFTPage;