import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

class ClassList {
  constructor() {
    this.values = new Set();
  }

  toggle(name, force) {
    if (force) {
      this.values.add(name);
      return true;
    }
    this.values.delete(name);
    return false;
  }

  contains(name) {
    return this.values.has(name);
  }
}

class ElementStub {
  constructor(id = "") {
    this.id = id;
    this.dataset = {};
    this.listeners = {};
    this.classList = new ClassList();
    this.attributes = {};
    this.options = [];
    this.value = "";
    this.open = false;
    this.clientWidth = 760;
    this.width = 760;
    this.height = 320;
    this.style = {};
    this.innerHTML = "";
    this.textContent = "";
  }

  addEventListener(eventName, handler) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(handler);
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "open") this.open = true;
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "open") this.open = false;
  }

  focus() {
    documentStub.activeElement = this;
  }

  reset() {
    this.resetCalled = true;
  }

  reportValidity() {
    return true;
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  getContext() {
    return {
      beginPath() {},
      clearRect() {},
      closePath() {},
      fill() {},
      fillRect() {},
      fillText() {},
      lineTo() {},
      moveTo() {},
      setTransform() {},
      stroke() {}
    };
  }

  closest() {
    return null;
  }
}

function makeSelect(id, values, selectedValue = values[0]) {
  const element = new ElementStub(id);
  element.options = values.map((value) => ({ value }));
  element.value = selectedValue;
  return element;
}

const ids = [
  "catalogList",
  "catalogCount",
  "reportFamily",
  "reportTitle",
  "reportSummary",
  "reportStatus",
  "reportAsOf",
  "metricGrid",
  "rulesList",
  "eventsList",
  "trustChecks",
  "reviewStepper",
  "reviewTable",
  "waitlistModal",
  "waitlistForm",
  "formMessage",
  "emailInput",
  "interestInput",
  "priceInput",
  "chartSummary"
];

const elements = Object.fromEntries(ids.map((id) => [id, new ElementStub(id)]));
elements.categoryFilter = makeSelect("categoryFilter", ["all", "Broad market", "Technology", "Sector"]);
elements.riskFilter = makeSelect("riskFilter", ["all", "Moderate", "Elevated", "High"]);
elements.statusFilter = makeSelect("statusFilter", ["all", "research", "paper-live", "retired"]);
elements.timeframeControl = makeSelect("timeframeControl", ["5Y", "10Y"], "10Y");
elements.costControl = makeSelect("costControl", ["estimatedNet", "gross"], "estimatedNet");
elements.benchmarkControl = makeSelect("benchmarkControl", ["SPY", "QQQ", "IWM"], "SPY");
elements.equityChart = new ElementStub("equityChart");
elements.drawdownChart = new ElementStub("drawdownChart");
elements.emailInput.value = "qa@example.com";
elements.interestInput.value = "reports";
elements.priceInput.value = "research-15";

const views = ["research", "methodology", "data-risk", "review"].map((view) => {
  const element = new ElementStub(`${view}-view`);
  element.dataset.view = view;
  return element;
});

const viewButtons = ["research", "methodology", "data-risk", "review"].map((view) => {
  const element = new ElementStub(`${view}-button`);
  element.dataset.viewButton = view;
  return element;
});

const queueButtons = ["all", "draft", "quant", "compliance", "published"].map((filter) => {
  const element = new ElementStub(`${filter}-filter`);
  element.dataset.queueFilter = filter;
  return element;
});

const waitlistButtons = [new ElementStub("waitlist-top"), new ElementStub("waitlist-side")];
const closeButton = new ElementStub("close-button");

const documentListeners = {};
const documentStub = {
  activeElement: null,
  addEventListener(eventName, handler) {
    documentListeners[eventName] = documentListeners[eventName] || [];
    documentListeners[eventName].push(handler);
  },
  getElementById(id) {
    return elements[id] || null;
  },
  querySelector(selector) {
    if (selector === ".close-button") return closeButton;
    return null;
  },
  querySelectorAll(selector) {
    if (selector === "[data-view]") return views;
    if (selector === "[data-view-button]") return viewButtons;
    if (selector === "[data-open-waitlist]") return waitlistButtons;
    if (selector === "[data-queue-filter]") return queueButtons;
    return [];
  }
};

const localStorageState = new Map();
const context = {
  console,
  document: documentStub,
  window: {
    devicePixelRatio: 1,
    location: { hash: "" },
    history: { replaceState(_state, _title, hash) { this.lastHash = hash; context.window.location.hash = hash; } },
    localStorage: {
      getItem(key) {
        return localStorageState.has(key) ? localStorageState.get(key) : null;
      },
      setItem(key, value) {
        localStorageState.set(key, value);
      }
    },
    addEventListener() {},
    clearTimeout,
    requestAnimationFrame(callback) {
      callback();
    },
    setTimeout
  },
  clearTimeout,
  setTimeout
};
context.globalThis = context;

const script = fs.readFileSync(new URL("./app.js", import.meta.url), "utf8");
vm.runInNewContext(script, context, { filename: "website/app.js" });
for (const handler of documentListeners.DOMContentLoaded || []) {
  handler();
}

assert.match(elements.catalogList.innerHTML, /SPY/);
assert.match(elements.metricGrid.innerHTML, /Max drawdown/);
assert.match(elements.metricGrid.innerHTML, /Worst month/);
assert.match(elements.rulesList.innerHTML, /Lower-band trigger/);
assert.match(elements.eventsList.innerHTML, /trigger/);
assert.match(elements.chartSummary.innerHTML, /benchmark return/);

elements.categoryFilter.value = "Sector";
elements.categoryFilter.listeners.change[0]({ target: elements.categoryFilter });
assert.match(elements.catalogList.innerHTML, /XLF|XLE/);
assert.match(elements.reportTitle.textContent, /research report/);

viewButtons.find((button) => button.dataset.viewButton === "data-risk").listeners.click[0]();
assert.equal(viewButtons.find((button) => button.dataset.viewButton === "data-risk").attributes["aria-pressed"], "true");

waitlistButtons[0].listeners.click[0]({ currentTarget: waitlistButtons[0] });
assert.equal(elements.waitlistModal.open, true);
elements.waitlistForm.listeners.submit[0]({ preventDefault() {} });
assert.match(elements.formMessage.textContent, /No payment/);
assert.ok(localStorageState.get("strategyLedgerWaitlist"));

console.log("website smoke test passed");
