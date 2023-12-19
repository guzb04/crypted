import { useState } from "react";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('')
    const [status, setStatus] = useState('')

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
                console.log('ok')
                setStatus('OK!')
                const responseBody = await response.text();
                console.log(responseBody);
            }else{
                console.log('error')
            }
        
        }
        catch(error){
            console.log(error)
        }
    }

    return ( <div className="upload file_form">
        <div className="form_title">
            <h3>Upload your .zip file</h3>
            <p>this will return an encrypted file</p>
        </div>
            <form className="upload_form" onSubmit={handleSubmit}>
                <label htmlFor="upload_string">add a key for encryption here</label>
                <input type="text" id="upload_string" value={ key } onChange={handleKeyChange}/>
                <input type="file" className="upload_file" onChange={handleFileChange} name="file"/>
                <button className="upload_send" type="submit">send the data</button>
            </form>
            <p>STATUS: { status }</p>
    </div> );
}
 
export default Upload;