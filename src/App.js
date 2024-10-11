import './App.css';
import React, {useState, useEffect } from 'react';

function App() {

  const [files, setFiles] = useState([]);
  const [response, setResponse] = useState([]);

  // Log the response whenever it changes
  useEffect(() => {
    console.log('Updated response:', response);
  }, [response]); // This will run

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);

    const newFiles = uploadedFiles.filter(
      x => !files.some(f => f.name === x.name)
    );

    
    if (newFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);

      
      const newResponseEntries = newFiles.map(file => ({
        fileName: file.name,
        data: null, 
      }));

      setResponse(prevResponse => [...prevResponse, ...newResponseEntries]);

    } else {
      alert('File(s) already uploaded.');
    }
  }

  const handleValidate = async () => {

    if (files.length === 0) {
      alert('No files uploaded to validate.');
      return;
    }

    for (const file of files){

      try{
        const formData = new FormData();
        formData.append('file', file); 

        const res = await fetch('https://acrdemo2024-bfaqesdcfcgzhsae.canadacentral-01.azurewebsites.net/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await res.json(); 

        setResponse(prevResponse =>
          prevResponse.map(entry =>
            entry.fileName === result.fileName ? { ...entry, data: result } : entry
          )
        );

      } catch(error){
        console.error('Error:', error);

        setResponse(prevResponse =>
          prevResponse.map(entry =>
            entry.fileName === file.fileName ? { ...entry,  error: 'Failed to upload file.' } : entry
          )
        );
        
      }
    }
  };

  return (
    <div className='app-container'>
      <div className='upload-section'>
        <h2>Upload Files</h2>
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange} 
          className='file-input' 
        />

        {/* New Row: Validate Button */}
        <div className="validate-row">
          <button onClick={handleValidate} className='validate-button'>
            Validate
          </button>
        </div>
      </div>

      <div className="file-display-section">
        <h2>Uploaded Files</h2>
        <div className="file-list">
          {files.length > 0 ? (
            files.map((file, index) => {
              // Find the corresponding response for the current file
              const fileResponse = response.find(entry => entry.fileName === file.name);

              return (
                <div key={index} className="file-info">
                  <p><strong>Name:</strong> {file.name}</p>
                  <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>

                  {/* Check if there is a response for the current file */}
                  {fileResponse && fileResponse.data && fileResponse.data.message && (
                    <p className="message" style={{ 
                      backgroundColor: fileResponse.data.is_valid ? 'lightgreen' : 'lightcoral',
                      padding: '10px',
                      borderRadius: '5px',
                      marginTop: '10px'
                    }}>
                      {fileResponse.data.message}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
