const SerialPort = require("serialport");

const port = new SerialPort({
  path: "COM7",
  baudRate: 110,
  dataBits: 8,
  stopBits: 2,
  parity: "none", // domyślnie 'none', możesz zmienić, jeśli potrzebujesz
});

// Otwórz port
port.on("open", () => {
  console.log("Port otwarty: " + port.path);
});

// Odbieranie danych
port.on("data", (data) => {
  console.log("Odebrane dane: " + data.toString());
});

// Obsługa błędów
port.on("error", (err) => {
  console.error("Błąd: ", err.message);
});
