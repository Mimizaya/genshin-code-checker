import './style/App.css';
import InputChecker from './InputChecker.jsx';
import ImportExport from './ImportExport.jsx';

export default function App() {

  return (
    <>
      <header>
        <h1><img src="./logo.png"/></h1>
      </header>
      <main>
        <InputChecker />
        <ImportExport />
      </main>
    </>
  )
}