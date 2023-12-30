import { useState } from "react";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('')
    const [status, setStatus] = useState('waiting for a zip file to encrypt')

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
        formData.append('upload_key', key)

        try{
            setStatus('sending...')
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok){
                setStatus('OK!')
                const responseBody = await response.text();
                console.log(responseBody);
                try{
                    setStatus('OK! waiting for download')
                    const responseJson = await fetch('http://localhost:3000/upload',{
                        method: 'GET',
                        headers: {
                            iv: responseBody
                        }
                    })
                    if (responseJson.ok){
                        setStatus('OK! your download should start soon')
                        const responseJsonBody = await responseJson.text();
    
                        const blob = new Blob([responseJsonBody], {type: 'application/json'});
                        const link = document.createElement('a');
    
                        link.href = URL.createObjectURL(blob);
                        link.download = 'crypted.json'
    
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setStatus('OK!')
                    }else if(responseJson.status == 300){
                        setStatus('ERROR! server error, try again later')
                    }else{
                        setStatus('ERROR! unknown error')
                    }

                }catch(error){
                    console.log(error)
                }
            }else if (response.status == 400){
                console.log(response.status);
                setStatus('ERROR! the file attatched is not .zip');
                console.log('error');
            }else if (response.status == 300){
                setStatus('ERROR! the server has ran into an error, please try again');
            }else{
                setStatus('ERROR! unknown error')
            }
        
        }
        catch(error){
            setStatus('ERROR! unknown error')
            console.log(error)
        }
    }

    const askForKey = async ()=>{
        try{
            let response = await fetch('http://localhost:3000/key')

            if(response.ok){
                let data = await response.text();
                setKey(data)
            }
        }
        catch(error){
            console.log(error)
        }
    }

    return ( <div className="upload file_form">
        <div className="form_title">
            <h3>Upload your .zip file</h3>
            <p>upload the file you want to encrypt and a download will start soon!</p>
            <button onClick={ askForKey }>click me to generate a key!</button>
        </div>
            <form className="upload_form" onSubmit={handleSubmit}>
                <label htmlFor="upload_string">Copy the key below</label>
                <input type="text" id="upload_string" value={ key } onChange={handleKeyChange} disabled/>
                <input type="file" className="upload_file" onChange={handleFileChange} name="file"/>
                <button className="upload_send" type="submit">send the data</button>
            </form>
            <p>STATUS: { status }</p>
    </div> );
}
 
export default Upload;