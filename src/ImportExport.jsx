export default function ImportExport() {

  // Function to handle exporting the codes to a .json file
  const exportCodes = () => {
    // Get codes from localStorage
    const codesToExport = JSON.parse(localStorage.getItem('updatedKnownCodes')) || [];

    // Convert the codes to a JSON string
    const jsonContent = JSON.stringify(codesToExport, null, 2); // Indented JSON for better readability

    // Create a Blob from the JSON string
    const blob = new Blob([jsonContent], { type: 'application/json' });

    // Create a link to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); // Create an object URL for the blob
    link.download = 'libens-code-checker-known-codes.json'; // Set the download file name

    // Trigger the download by programmatically clicking the link
    link.click();
  };

  // Function to handle uploading and setting the codes from a .json file to localStorage
  const importCodes = (e) => {
    const file = e.target.files[0]; // Get the uploaded file

    if (!file) {
      alert('No file selected');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsedData = JSON.parse(reader.result); // Parse the uploaded file content
        if (Array.isArray(parsedData)) {
          // Set the codes to localStorage and state if it's a valid array
          localStorage.setItem('updatedKnownCodes', JSON.stringify(parsedData));
          window.location.reload();
        } else {
          alert('Uploaded file is not a valid array');
        }
      } catch (error) {
        alert('Invalid JSON file');
      }
    };

    reader.onerror = () => {
      alert('Error reading the file');
    };

    reader.readAsText(file); // Read the file as text
  };

  // Function to delete localstorage data
	const deleteData = () => {
	  const confirmation = window.confirm('Are you sure you want to delete the data?');
	  
	  if (confirmation) {
	    // If the user clicks "OK", remove the item from localStorage
	    localStorage.removeItem('updatedKnownCodes');
	    window.location.reload();
	  } else {
	    	return;
	  }
	};

	return (
		<>
			<div id="import-export-data">

				{/* Export Button */}
				<button className="data-button export" onClick={() => exportCodes()}>
					<p>Export Codes</p>
					<img src="./cryo.png" />
				</button>

				{/* Import Button */}
				<button className="data-button import" onClick={() => document.getElementById('file-upload').click()}>
	        <p>Import Codes</p>
					<img src="./dendro.png" />
	      </button>

				{/* Delete Button */}
	      <button className="data-button delete" onClick={() => deleteData()}>
	        <p>Delete Data</p>
					<img src="./pyro.png" />
	      </button>

	      {/* Hidden File Input */}
	      <input
	        type="file"
	        id="file-upload"
	        accept=".json"
	        style={{ display: 'none' }}
	        onChange={importCodes}
	      />

      </div>
    </>
	);
}