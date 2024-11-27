import { useState, useEffect } from 'react';
import { knownCodes } from './data/knownCodes.jsx';
import { blackList } from './data/blackList.jsx';

export default function InputChecker() {


	// USER INPUT	
	// ——————————————————————————————————————————————————————————————————————————————————————————
	// #1 State: User input 
  	const [input, setInput] = useState('');
	// #2 Function: Update the input field & filter displayed list 
		const handleInputChange = (e) => {
		  const inputText = e.target.value;
		  setInput(inputText);

		  // Split the inputText by whitespace to get individual search terms
		  const searchTerms = inputText.trim().replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/); // Splitting on spaces/tabs/newlines
		  
		  // Remove any term that is less than X length
		  const pruneLength = 2;
		  const searchTermsPrunedLength = searchTerms.filter((term) => term.length >= pruneLength)

		  // If there are no search terms, reset the displayedKnownCodes to all knownCodes
		  if (searchTermsPrunedLength.length === 0 || searchTermsPrunedLength[0] === "") {
		    setDisplayedKnownCodes(updatedKnownCodes);
		    return;
		  }

		  // Filter the knownCodes based on each search term (case-insensitive matching)
		  const filteredCodes = updatedKnownCodes.filter((code) => 
		    searchTermsPrunedLength.some((term) => code.toLowerCase().startsWith(term.toLowerCase()))
		  );

		  // Update displayedKnownCodes with the filtered list
		  setDisplayedKnownCodes(filteredCodes);
		};
	// #3 Function: Process the user input 
		const checkInput = () => {
	  
	  // 1. Parse input
		  const parsedCodes = input
		    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Reduce to alphanumeric
		    .split(/\s+/) // Split by any whitespace (spaces, tabs, newlines)
		    .filter((entry) => entry.length >= 6); // Reduce to entries of 6 length or more
	  
	  // 2. Remove blacklisted words. Case-insensitive matching
			const whiteListed = parsedCodes.filter((code) => {
			  const lowerCode = code.toLowerCase(); // Convert current code to lowercase
			  return !blackList.some((blackCode) => blackCode.toLowerCase() === lowerCode); // Check if the code is in the blacklist (case-insensitive)
				});
		
		// 3. Remove duplicates
		  const removeDuplicates = (array) => {
		    const seen = new Set();
		    return array.filter(entry => {
		      if (seen.has(entry)) {
		        return false; // Skip duplicates
		      } else {
		        seen.add(entry);
		        return true;
		      }
		    });
		  };
			const whiteListedUnique = removeDuplicates(whiteListed);
		
		// 4. Arrays to hold codes for each status
		  const newCodesArray = [];
		  const partialCodesArray = [];
		  const discardCodesArray = [];
		
		// 5. Process the unique and whitelisted codes
		  whiteListedUnique.forEach((code) => {
		    
			  // Convert the current code to lowercase for case-insensitive comparison
			  const lowerCode = code.toLowerCase();

			  // Check for partial matches (first 4 characters match, case-insensitive)
			  const partialMatch = updatedKnownCodes.find((knownCode) => 
			    knownCode.slice(0, 4).toLowerCase() === lowerCode.slice(0, 4) // Compare first 4 characters in lowercase
			  );

			  // Compare the code against updatedKnownCodes
			  if (!updatedKnownCodes.some((knownCode) => knownCode.toLowerCase() === lowerCode) && !partialMatch) {
			    newCodesArray.push({ code, status: 'new' }); // Fully new code
			  } 
			  else if (updatedKnownCodes.some((knownCode) => knownCode.toLowerCase() === lowerCode)) {
			    discardCodesArray.push({ code, status: 'discard' }); // Fully used code
			  } 
			  else if (partialMatch) {
			    partialCodesArray.push({ code, status: 'partial' }); // Partial match
			  }
			});

		// 6. Update the state with the unique categorized arrays
		  setParsedInput({
		    newCodes: newCodesArray,
		    partialCodes: partialCodesArray,
		    discardCodes: discardCodesArray
		  });
		};
	// #4 Function: Clear user input button 
		const clearInput = () => {
			setInput('');
			setDisplayedKnownCodes(updatedKnownCodes)
		}


  // KNOWN CODES
	// ——————————————————————————————————————————————————————————————————————————————————————————
  // #1 State: List of known codes 
  	const [updatedKnownCodes, setUpdatedKnownCodes] = useState(knownCodes);
  // #2 State: Displayed list of codes (filterable by input #2) 
  	const [displayedKnownCodes, setDisplayedKnownCodes] = useState(updatedKnownCodes);
  // #3 Sort: Known codes sorted alphabetically 
	  const sortedCodes = displayedKnownCodes?.sort((a, b) => {
	  	if (a.toLowerCase() > b.toLowerCase()) {
	  		return 1;
	  	}
	  	if (a.toLowerCase() < b.toLowerCase()) {
	  		return -1;
	  	}
	  	return 0;
	  })
	// #4 Function: Copy all known codes to clipboard 
		const copyAllCodesToClipboard = () => {
		  // Remove commas and split the string into separate words (by spaces, tabs, or newlines)
		  
		  if (updatedKnownCodes.length > 0) {
		    // Join the codes with newlines and copy to clipboard
		    const textToCopy = updatedKnownCodes.join('\n');
		    
		    navigator.clipboard.writeText(textToCopy)
		      .catch((err) => {
		        console.error('Failed to copy: ', err);
		      });
		  } else {
		    alert('No new codes to generate links for.');
		  }
		}; 
	// #5 Effect: Synchronize displayed codes with known codes 
	  useEffect(() => {
	    setDisplayedKnownCodes(updatedKnownCodes);
	  }, [updatedKnownCodes]); // This effect will run whenever updatedKnownCodes changes
	

  // PARSED INPUT
	// ——————————————————————————————————————————————————————————————————————————————————————————
  // #1 State: Parsed user input 
  	const [parsedInput, setParsedInput] = useState([]);
  // #2 Function: Generate links for all valid entries and copy to clipboard 
		const generateLinks = () => {
		  // Define the base URL
		  const baseUrl = 'https://genshin.hoyoverse.com/en/gift?code=';

		  // Filter the newCodes state to include only those with status 'new'
		  const filteredNewCodes = parsedInput.newCodes.filter(entry => entry.status === 'new');
		  const filteredPartialCodes = parsedInput.partialCodes.filter(entry => entry.status === 'new');
		  const filteredDiscardCodes = parsedInput.discardCodes.filter(entry => entry.status === 'new');
		  const filteredCodes = filteredNewCodes?.concat(filteredPartialCodes?.concat(filteredDiscardCodes))

		  // Generate the full URL for each entry and join them with a line break
		  // Wrap in <> to remove embed for Discord sharing
		  const fullUrls = filteredCodes
		    .map(entry => `<${baseUrl}${entry.code}>`) // Make sure to access the code, not the whole entry
		    .join('\n'); // Join URLs with line breaks

		  // Only proceed if there are URLs to copy
		  if (fullUrls) {
		    // Copy the concatenated URLs to the clipboard
		    navigator.clipboard.writeText(fullUrls)
		      .then(() => {
		        alert('Links copied to clipboard!');
		      })
		      .catch((err) => {
		        console.error('Failed to copy: ', err);
		      });
		  } else {
		    alert('No new codes to generate links for.');
		  }
		};
  // #3 Function: Add codes to known codes 
		const addToKnownCodes = () => {
		  setUpdatedKnownCodes(prevKnownCodes => {

		    // Filter parsed input to only include codes with 'new' or 'partial' status
		    const addNewToKnown = parsedInput.newCodes.filter((entry, index, self) => 
		      (entry.status === 'new' || entry.status === 'partial') && 
		      !prevKnownCodes.includes(entry.code) && // Check if code is already in prevKnownCodes
		      self.findIndex(e => e.code === entry.code) === index // Remove duplicates within the newCodes array
		    );

		    const addPartialToKnown = parsedInput.partialCodes.filter((entry, index, self) => 
		      (entry.status === 'new' || entry.status === 'partial') && 
		      !prevKnownCodes.includes(entry.code) && // Check if code is already in prevKnownCodes
		      self.findIndex(e => e.code === entry.code) === index // Remove duplicates within the partialCodes array
		    );

		    // Combined codes to add
		    const addToKnown = addNewToKnown.concat(addPartialToKnown);

		    // Add filtered codes to prevKnownCodes
		    return [...prevKnownCodes, ...addToKnown.map(entry => entry.code)]; // Add only the code values
		  });
		};
	// #4 Function: Change code status 
		const handleChangeStatus = (code) => {
		  setParsedInput((prevCodes) => {
		    // Create new arrays for each category
		    const newCodesArray = [...prevCodes.newCodes];
		    const partialCodesArray = [...prevCodes.partialCodes];
		    const discardCodesArray = [...prevCodes.discardCodes];

		    // Function to update status of a specific code
		    const updateStatus = (array, status) => {
		      return array.map((entry) => {
		        if (entry.code === code) {
		          // Cycle through the statuses in the order of partial -> new -> discard
		          let newStatus;
		          if (entry.status === 'partial') {
		            newStatus = 'new';
		          } else if (entry.status === 'new') {
		            newStatus = 'discard';
		          } else if (entry.status === 'discard') {
		            newStatus = 'partial';
		          }

		          // Return the updated entry with the new status
		          return { ...entry, status: newStatus };
		        }
		        return entry; // Return other entries unchanged
		      });
		    };

		    // Check each array and update the status if the code exists in that array
		    if (newCodesArray.find((entry) => entry.code === code)) {
		      return {
		        newCodes: updateStatus(newCodesArray, 'new'),
		        partialCodes: [...partialCodesArray],
		        discardCodes: [...discardCodesArray],
		      };
		    }

		    if (partialCodesArray.find((entry) => entry.code === code)) {
		      return {
		        newCodes: [...newCodesArray],
		        partialCodes: updateStatus(partialCodesArray, 'partial'),
		        discardCodes: [...discardCodesArray],
		      };
		    }

		    if (discardCodesArray.find((entry) => entry.code === code)) {
		      return {
		        newCodes: [...newCodesArray],
		        partialCodes: [...partialCodesArray],
		        discardCodes: updateStatus(discardCodesArray, 'discard'),
		      };
		    }

		    // If the code is not found in any array, return the previous state unchanged
		    return prevCodes;
		  });
		};

		const numberOfParsedCodes =       	
			parsedInput.newCodes?.length + 
    	parsedInput.partialCodes?.length +
    	parsedInput.discardCodes?.length;
	// #5 Function: Add to visited links 
	  const [visitedLinks, setVisitedLinks] = useState([]);
		const handleVisitedLinks = (code, event) => {

			// If right-click, return early
			if(event.button === 2) {
				return;
			}

			// If other clicks, continue
		  setVisitedLinks((prevLinks) => {
		    if (!prevLinks.includes(code)) {
		      return [...prevLinks, code]; // Add the code to the state if it's not already visited
		    }
		    return prevLinks; // If the code is already in the visited list, don't add it again
		  });
		};
	// #6 Function: Hover over buttons, display image 
		const [hoveredComponent, setHoveredComponent] = useState(null);

	  // Handler for setting the hovered component
	  const handleHover = (componentName) => {
	    setHoveredComponent(componentName);
	  };

	  // Handler for clearing the hovered state
	  const handleLeave = () => {
	    setHoveredComponent(null);
	  };


	// SAVE/LOAD
	// ——————————————————————————————————————————————————————————————————————————————————————————
	// #1 State: Ensure sequence of effects 
		const [isLoaded, setIsLoaded] = useState(false); // Track if data has been loaded from localStorage
  // #2 Effect: Load known codes from localStorage 
	  useEffect(() => {
	    const storedCodes = localStorage.getItem('updatedKnownCodes');
	    
	    if (storedCodes) {
	      // If storedCodes exists, parse and set state
	      try {
	        const parsedCodes = JSON.parse(storedCodes);
	        setUpdatedKnownCodes(parsedCodes); // If found, load them
	      } catch (error) {
	        console.error('Error parsing stored codes:', error);
	      }
	    } else {
	      setUpdatedKnownCodes(knownCodes); // If not found, fallback to default knownCodes
	    }
    
    	setIsLoaded(true); // Mark that loading is complete
  	}, []); // Empty array ensures this effect runs only once when the component mounts
  // #3 Effect: Save known codes to localStorage (after initial load) 
	  useEffect(() => {
	    // Avoid saving to localStorage until data has been loaded from localStorage
	    if (isLoaded && updatedKnownCodes !== knownCodes) {
	      localStorage.setItem('updatedKnownCodes', JSON.stringify(updatedKnownCodes));
	    }
	  }, [updatedKnownCodes, isLoaded]); // This will run every time updatedKnownCodes changes after initial load


	return (
		<>
		<div id="links">
			<a className="yoimiya" href="https://www.hoyolab.com/topicDetail/3882" target="_blank"><img src="./yoimiya.png" /></a>
			<a className="nahida" href="https://genshin-impact.fandom.com/wiki/Promotional_Code#Active_Codes" target="_blank"><img src="./nahida.png" /></a>
		</div>

		<div id="input-codes">
			<h3>
				Input Codes
				<button onClick={() => clearInput()} className="clear-input">&#x2716;</button>
			</h3>
			<textarea 
				id="input-codes-textarea" 
				type="text"
				value={input}
				onChange={(e) => handleInputChange(e)}
			/>
			<button onClick={() => checkInput()}>Process Input</button>
		</div>

    <div id="known-codes">
      <h3>
      	Known Codes ({updatedKnownCodes.length})      
      	<button onClick={() => copyAllCodesToClipboard()}><img src="./copy.png"/></button>
      </h3>

      <ul>
        {sortedCodes.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
      <div className="bottom-edge"></div>
    </div>

    <div id="parsed-codes">
    	<div id="parsed-codes-header">
	      <h3>New Codes {parsedInput.newCodes?.length > 0 && `(${parsedInput.newCodes?.length})`}</h3>
	      <h3>Partial Matches {parsedInput.partialCodes?.length > 0 && `(${parsedInput.partialCodes?.length})`}</h3>
	      <h3>Used Codes {parsedInput.discardCodes?.length > 0 && `(${parsedInput.discardCodes?.length})`}</h3>
      </div>

      <div id="code-results">
	      <ul>
	        {parsedInput.newCodes?.map((entry, index) => (
	        	<>
		          <li className={entry.status} key={index}>
		          	<button className={'change-status ' + entry.status} onClick={() => handleChangeStatus(entry.code)}>
				          <span className={'circle-outer ' + entry.status}>
				          	<span className="circle-inner"></span>
				          </span>
				          <p>{entry.code}</p>
		          	</button>
								<a onMouseDown={(e) => handleVisitedLinks(entry.code, e)} href={`https://genshin.hoyoverse.com/en/gift?code=${entry.code}`} target="_blank">
									<img src={visitedLinks?.includes(entry.code) ? './visited.png' : './link.png'}/>
								</a>
		          </li>
	          </>
	        ))}
	      </ul>

	      <ul>
	        {parsedInput.partialCodes?.map((entry, index) => (
	        	<>
		          <li className={entry.status} key={index}>
		          	<button className={'change-status ' + entry.status} onClick={() => handleChangeStatus(entry.code)}>
				          <span className={'circle-outer ' + entry.status}>
				          	<span className="circle-inner"></span>
				          </span>
				          <p>{entry.code}</p>
		          	</button>
								<a onMouseDown={(e) => handleVisitedLinks(entry.code, e)} href={`https://genshin.hoyoverse.com/en/gift?code=${entry.code}`} target="_blank">
									<img src={visitedLinks?.includes(entry.code) ? './visited.png' : './link.png'}/>
								</a>
		          </li>
	          </>
	        ))}
	      </ul>

	      <ul>
	        {parsedInput.discardCodes?.map((entry, index) => (
	        	<>
		          <li className={entry.status} key={index}>
		          	<button className={'change-status ' + entry.status} onClick={() => handleChangeStatus(entry.code)}>
				          <span className={'circle-outer ' + entry.status}>
				          	<span className="circle-inner"></span>
				          </span>
				          <p>{entry.code}</p>
		          	</button>
								<a onMouseDown={(e) => handleVisitedLinks(entry.code, e)} href={`https://genshin.hoyoverse.com/en/gift?code=${entry.code}`} target="_blank">
									<img src={visitedLinks?.includes(entry.code) ? './visited.png' : './link.png'}/>
								</a>
		          </li>
	          </>
	        ))}
	      </ul>

      	<div className="bottom-edge"></div>
    	</div>

	  	<div id="new-codes-buttons">
	  		<div id="paimon-images">
	    		{hoveredComponent === 'generate-links' &&
		    		<img src="./paimon_lookout.png" />
	    		}
	    		{hoveredComponent === 'add-new' &&
		    		<img src="./paimon_thumbs_up.png" />
	    		}
	  		</div>

	    	<button 
					onMouseEnter={() => handleHover('generate-links')}
	    		onMouseLeave={handleLeave}
	    		onClick={() => generateLinks()}
	    	>Generate Links
	    	</button>

	    	<button 
					onMouseEnter={() => handleHover('add-new')}
	    		onMouseLeave={handleLeave}
	    		onClick={() => addToKnownCodes()}
	    	>Add New Codes
	    	</button>
	  	</div>
    </div>
    </>
	);
}