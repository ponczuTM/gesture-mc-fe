const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const baudRates = [
  110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200,
  128000, 256000,
];
const dataBits = [5, 6, 7, 8];
const stopBits = [1, 2];

let currentConfigIndex = 0;

function monitorPort(baudRate, dataBits, stopBits) {
  console.clear();
  console.log(
    `Nasłuchiwanie na COM9 z ustawieniami: BaudRate=${baudRate}, DataBits=${dataBits}, StopBits=${stopBits}`
  );

  const port = new SerialPort({
    path: "COM7",
    baudRate: baudRate,
    dataBits: dataBits,
    stopBits: stopBits,
    parity: "none",
    autoOpen: false,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  port.open((err) => {
    if (err) {
      console.log(`Błąd otwierania portu: ${err.message}`);
      nextConfig();
      return;
    }

    console.log("Port otwarty, oczekiwanie na dane...");

    parser.on("data", (data) => {
      console.clear();
      console.log(`Odebrano dane z COM7: ${data}`);
      console.log(
        `Ustawienia: BaudRate=${baudRate}, DataBits=${dataBits}, StopBits=${stopBits}`
      );
    });

    setTimeout(() => {
      port.close((err) => {
        if (err) {
          console.log(`Błąd zamykania portu: ${err.message}`);
        } else {
          console.log("Port zamknięty.");
        }
        nextConfig();
      });
    }, 5000);
  });
}

function nextConfig() {
  currentConfigIndex++;
  const totalConfigs = baudRates.length * dataBits.length * stopBits.length;

  if (currentConfigIndex < totalConfigs) {
    const baudRate =
      baudRates[
        Math.floor(currentConfigIndex / (dataBits.length * stopBits.length)) %
          baudRates.length
      ];
    const dataBit =
      dataBits[
        Math.floor(currentConfigIndex / stopBits.length) % dataBits.length
      ];
    const stopBit = stopBits[currentConfigIndex % stopBits.length];

    monitorPort(baudRate, dataBit, stopBit);
  } else {
    console.log("Wszystkie kombinacje ustawień zostały przetestowane.");
  }
}

nextConfig();
