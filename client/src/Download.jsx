import { useState } from "react";

const Download = () => {
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('')

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
        formData.append('upload_file', file)
        formData.append('upload_key', key)

        try{
            const response = await fetch('http://localhost:3000/download', {
                method: 'POST',
                body: formData
            });

            if (response.ok){
                console.log('ok')
            }else{
                console.log('error')
            }
        }
        catch(error){
            console.log(error)
        }
    }

    return ( <div className="download file_form">
    <div className="form_title">
        <h3>Download your .zip file</h3>
        <p>this will return an decrypted file</p>
    </div>
        <form className="download_form" onSubmit={handleSubmit}>
            <label htmlFor="download_string">add a key for encryption here</label>
            <input type="text" id="download_string" value={key} onChange={handleKeyChange}/>
            <input type="file" className="download_file" onChange={handleFileChange}/>
            <button formAction="send" className="download_send">send the data</button>
        </form>
</div> );
}
 
export default Download;