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
                setStatus('OK!')
                const responseBody = await response.text();
                console.log(responseBody);
                try{
                    const responseJson = await fetch('http://localhost:3000/upload',{
                        method: 'GET',
                        headers: {
                            iv: responseBody
                        }
                    })
                    const responseJsonBody = await responseJson.text();

                    const blob = new Blob([responseJsonBody], {type: 'application/json'});
                    const link = document.createElement('a');

                    link.href = URL.createObjectURL(blob);
                    link.download = 'crypted.json'

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link)

                }catch(error){
                    console.log(error)
                }
            }else{
                console.log('error')
            }
        
        }
        catch(error){
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
            <p>this will return an encrypted file</p>
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