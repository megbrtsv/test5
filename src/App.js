import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);

  const addCrypto = (cryptoId, multiplier) => {
    setSelectedCryptos([...selectedCryptos, { id: cryptoId, multiplier: multiplier }]);
  };

  useEffect(() => {
    let totalValue = 0;
    selectedCryptos.forEach(crypto => {
      axios.get(`https://api.coingecko.com/api/v3/coins/${crypto.id}`)
        .then(response => {
          totalValue += response.data.market_data.ath.usd * crypto.multiplier;
          setPortfolioValue(totalValue);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }, [selectedCryptos]);

  return (
    <div>
      {selectedCryptos.map((crypto, index) => (
        <AthValue key={index} crypto={crypto.id} multiplier={crypto.multiplier} />
      ))}
      <p>Il valore totale del tuo portafoglio se fosse agli ATH è di: $ {portfolioValue}</p>
      <AddCrypto onAdd={addCrypto} />
    </div>
  );
}

function AddCrypto(props) {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [multiplier, setMultiplier] = useState(1);

  const handleCryptoChange = (event) => {
    setSelectedCrypto(event.target.value);
  };

  const handleMultiplierChange = (event) => {
    setMultiplier(parseFloat(event.target.value));
  };

  const handleAddClick = () => {
    if (selectedCrypto !== '') {
      props.onAdd(selectedCrypto, multiplier);
      setSelectedCrypto('');
      setMultiplier(1);
    }
  };

  return (
    <div>
      <CryptoSelector onChange={handleCryptoChange} />
      <MultiplierInput value={multiplier} onChange={handleMultiplierChange} />
      <button onClick={handleAddClick}>+</button>
    </div>
  );
}

function CryptoSelector(props) {
  const [cryptoList, setCryptoList] = useState([]);
  const { onChange } = props;

  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/coins/list')
      .then(response => {
        setCryptoList(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  if (cryptoList.length === 0) {
    return <p>Caricamento...</p>;
  }

  return (
    <select onChange={onChange}>
      <option value="">Seleziona una criptovaluta</option>
      {cryptoList.map(crypto => (
        <option key={crypto.id} value={crypto.id}>{crypto.name}</option>
      ))}
    </select>
  );
}

function MultiplierInput(props) {
  const { value, onChange } = props;

  return (
    <div>
      <label>
        Quantità:
        <input type="number" value={value} onChange={onChange} />
      </label>
    </div>
  );
}




function AthValue(props) {
const { crypto, multiplier } = props;
const [ath, setAth] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
if (crypto === '') {
setAth(null);
return;
}


axios.get(`https://api.coingecko.com/api/v3/coins/${crypto}`)
  .then(response => {
    setAth(response.data.market_data.ath.usd * multiplier);
    setError(null);
  })
  .catch(error => {
    console.log(error);
    setAth(null);
    setError('Errore durante il recupero del valore ATH');
  });
}, [crypto, multiplier]);

if (ath === null) {
return null;
}

return (
<div>
{error && <p>{error}</p>}
{!error && <p>Il valore del tuo portafoglio per {crypto} se fosse agli ATH è di: $ {ath}</p>}
</div>
);
}


export default App;
