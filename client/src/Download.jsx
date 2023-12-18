const Download = () => {
    return ( <div className="download file_form">
    <div className="form_title">
        <h3>Download your .zip file</h3>
        <p>this will return an decrypted file</p>
    </div>
        <form className="download_form">
            <label htmlFor="download_string">add a key for encryption here</label>
            <input type="text" id="download_string"/>
            <input type="file" className="download_file"/>
            <button formAction="send" className="download_send">send the data</button>
        </form>
</div> );
}
 
export default Download;