import { useState } from "react";

const Download = () => {
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('')
    const [status, setStatus] = useState('waiting for a file to decrypt')

    const handleFileChange = (event)=>{
        setFile(event.target.files[0])
    }

    const handleKeyChange = (event) =>{
        setKey(event.target.value)
    }

    const handleSubmit = async (event)=>{
        event.preventDefault();

        if (!file || !key){
            console.error("add a file and a key")
            return;
        }

        let formData = new FormData();
        formData.append('file', file)
        formData.append('key', key)

        try{
            setStatus('sending...')
            const response = await fetch('http://localhost:3000/download', {
                method: 'POST',
                body: formData
            });

            if (response.ok){
                setStatus('OK! waiting for download from server')
                const responseText = await response.text();
                try{

                    const newResponse = await fetch('http://localhost:3000/download', {
                        method: 'GET',
                        headers: {  
                            iv: responseText    
                        }
                    })
                    setStatus('OK! your download should start soon')
                    const filename = newResponse.headers.get('Content-Disposition').split('filename=')[1];
                    

                    const responseBlob = await newResponse.blob();

                    const url = window.URL.createObjectURL(responseBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    setStatus('OK!')
                    
                }catch(err){
                    console.log(err)
                }
            }else if (response.status == 400){
                setStatus('ERROR! you must send the json file with the encrypted data')
            }else if (response.status ==401){
                setStatus('ERROR! your key is not valid')
            }else{
                setStatus('ERROR! unknown error')
            }
        }
        catch(error){
            console.log(error)
        }
    }

    return ( <div className="download file_form">
    <div className="form_title">
        <h3>Download your .zip file</h3>
        <p>upload your encrypted json to get your decrypted file</p>
    </div>
        <form className="download_form" onSubmit={handleSubmit}>
            <label htmlFor="download_string">paste the key here</label>
            <input type="text" id="download_string" value={key} onChange={handleKeyChange}/>
            <input type="file" className="download_file" onChange={handleFileChange}/>
            <button formAction="send" className="download_send">send the data</button>
        </form>
        <p>STATUS: { status }</p>
</div> );
}
 
export default Download;