document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const opDisplay = document.getElementById("operation-display");
  const modeToggle = document.getElementById("mode-toggle");
  const keypad = document.querySelector(".keypad");

  let current = "0";
  let previous = "";
  let operator = null;
  let reset = false;
  let scientific = false;

  const update = () => {
    display.textContent = current;
    opDisplay.textContent = previous && operator ? `${previous} ${operator}` : "";
  };

  const format = n =>
    Number.isFinite(n) ? parseFloat(n.toFixed(10)).toString() : "Error";

  /* Mode toggle */
  modeToggle.onclick = () => {
    scientific = !scientific;
    modeToggle.textContent = scientific ? "Scientific Mode" : "Standard Mode";
    document.querySelectorAll(".sci-btn").forEach(b => b.classList.toggle("hidden"));
    keypad.classList.toggle("grid-cols-5");
    keypad.classList.toggle("grid-cols-4");
  };

  /* Input */
  const inputNumber = val => {
    if (val === "." && current.includes(".")) return;
    if (current === "0" || reset) {
      current = val === "." ? "0." : val;
      reset = false;
    } else {
      current += val;
    }
    update();
  };

  const operate = op => {
    if (operator && !reset) calculate();
    previous = current;
    operator = op;
    reset = true;
    update();
  };

  const calculate = () => {
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (isNaN(a) || isNaN(b)) return;

    let r;
    switch (operator) {
      case "+": r = a + b; break;
      case "−": r = a - b; break;
      case "×": r = a * b; break;
      case "÷": r = b === 0 ? NaN : a / b; break;
      case "^": r = Math.pow(a, b); break;
      default: return;
    }

    current = format(r);
    previous = operator = null;
    reset = true;
    update();
  };

  const sci = action => {
    const x = parseFloat(current);
    if (isNaN(x)) return;

    const map = {
      sqrt: () => Math.sqrt(x),
      log: () => x > 0 ? Math.log10(x) : NaN,
      ln: () => x > 0 ? Math.log(x) : NaN,
      sin: () => Math.sin(x * Math.PI / 180),
      cos: () => Math.cos(x * Math.PI / 180),
      tan: () => Math.tan(x * Math.PI / 180),
      pi: () => Math.PI,
      e: () => Math.E,
      factorial: () =>
        x >= 0 && Number.isInteger(x)
          ? [...Array(x)].reduce((a, _, i) => a * (i + 1), 1)
          : NaN,
      power: () => (previous = current, operator = "^", reset = true)
    };

    const result = map[action]();
    if (result !== undefined) current = format(result);
    update();
  };

  /* Button handling */
  document.querySelectorAll("[data-number]").forEach(b =>
    b.onclick = () => inputNumber(b.dataset.number)
  );

  document.querySelectorAll("[data-action]").forEach(b => {
    const a = b.dataset.action;
    b.onclick = () => {
      if (a === "operator") operate(b.textContent);
      else if (a === "equals") calculate();
      else if (a === "clear") (current = "0", previous = operator = null, update());
      else if (a === "sign") (current = format(-current), update());
      else if (a === "percent") (current = format(current / 100), update());
      else sci(a);
    };
  });

  update();
});
