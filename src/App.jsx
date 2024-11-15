import { useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

function App() {
  const modal = useRef();
  const selectedPlace = useRef();
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [pickedPlaces, setPickedPlaces] = useState([]);

  /* 
  An example of a redundant usage of the 'useEffect' - which is not recommended
  Unlike 'getCurrentPosition', the code within this useEffect runs synchronously (it finishes instantly - executes line by line)
  While in the 'getCurrentPosition' it was only completed once the 'callback' function executed by the browser
  */
  useEffect(() => {
    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    const storedPlaces = storedIds.map((id) => AVAILABLE_PLACES.find((place) => place.id === id));
    setPickedPlaces(storedPlaces);
  }, []);

  /* 
  The function passed within the useEffect hook will only execute AFTER the App component is done executing.

  In theory, the useEffect will also execute again.

  This is where the dependencies array comes into play. React looks at the dependencies and only executes the code within the useEffect
  if the value of the dependency has changed. 

  If an empty dependencies array is passed, the function within the useEffect would only execute ONCE.

  If no dependencies are passed (not even an empty array) the code would execute each time the App component executes. 
  */

  useEffect(() => {
    //'navigator' is provided by the browser
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, position.coords.latitude, position.coords.longitude);
      setAvailablePlaces(sortedPlaces);
    })
  }, []);

  function handleStartRemovePlace(id) {
    modal.current.open();
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    modal.current.close();
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    /*
    'localstorage' is provided by the browser
    These functions (localStorage.getItem() & localStorage.setItem()) allow data to be called from/stored in the browser (example: after the page is refreshed/reload or leaving the website)
    You have to pass two values: 1. Identifier 2. Value that should be stored (has to be in STRING format - this can be used through 'JSON.stringify()') 

    While this is an example of a 'side effect', it is an example that does not require a useEffect -  reason being that this code does not execute every time
    the state updates, rather only when the function is executed - therefore, NOT creating an infinite loop.
    */
    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem('selectedPlaces', JSON.stringify([id, ...storedIds]));
    }
  }

  function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    modal.current.close();

    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    localStorage.setItem('selectedPlaces', JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current))); //filter function deletes if true

  }

  return (
    <>
      <Modal ref={modal}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText="Sorting places by distance..."
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
