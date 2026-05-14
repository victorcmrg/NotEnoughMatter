// elements
const fileInput = document.getElementById("imageInput");
const errorEl = document.getElementById("errorMsg");
const previewEl = document.getElementById("preview");
const container = document.getElementById("hexContainer");
const linkBox = document.getElementById("generatedLinkBox");
const yamlSection = document.getElementById("yamlSection");

let lastCopied = null;
let currentNext = null;
let lastPixelList = null;

function safeCopy(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  return Promise.resolve();
}

function setNext(target) {
  if (currentNext === target) return;

  if (currentNext) {
    const left = currentNext.querySelector('.left-arrow');
    if (left) left.remove();
    currentNext.classList.remove('next-glow', 'slide-down');
  }

  currentNext = target;
  if (!target) return;

  target.classList.add('next-glow');

  if (!target.querySelector('.left-arrow')) {
    const arr = document.createElement('div');
    arr.className = 'left-arrow big-arrow';
    arr.textContent = '›';
    target.appendChild(arr);
  }

  target.classList.remove('slide-down');
  void target.offsetWidth;
  target.classList.add('slide-down');
}

function createLineBox(line, idx) {
  const box = document.createElement('div');
  box.className = 'hex-line-box';

  const num = document.createElement('div');
  num.className = 'line-number';
  num.textContent = (idx+1) + '.';

  const txt = document.createElement('div');
  txt.className = 'hex-text';
  txt.textContent = line;

  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';

  const label = document.createElement('div');
  label.className = 'copied-label';
  label.textContent = 'Copied!';

  btn.addEventListener('click', async () => {
    await safeCopy(line);

    if (lastCopied) {
      lastCopied.box.classList.remove('copied');
      lastCopied.label.classList.remove('visible');
    }

    box.classList.add('copied');
    label.classList.add('visible');
    lastCopied = { box, label };

    const next = box.nextElementSibling;
    if (next) setNext(next);
    else setNext(null);
  });

  box.appendChild(num);
  box.appendChild(txt);
  box.appendChild(btn);
  box.appendChild(label);
  return box;
}

function rgbToDecimal(hex) {
  if (hex === "0") return 0;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return (r * 65536) + (g * 256) + b;
}

// Check if all fields are filled
function checkYamlFields() {
  const id = document.getElementById("yamlID").value.trim();
  const name = document.getElementById("yamlName").value.trim();
  const mat = document.getElementById("yamlMaterial").value.trim();
  const btn = document.getElementById("generateYAML");
  
  if (id && name && mat && lastPixelList) {
    btn.disabled = false;
    btn.classList.remove('btn-disabled');
  } else {
    btn.disabled = true;
    btn.classList.add('btn-disabled');
  }
}

// Add input listeners (once, at load time)
document.getElementById("yamlID").addEventListener('input', checkYamlFields);
document.getElementById("yamlName").addEventListener('input', checkYamlFields);
document.getElementById("yamlMaterial").addEventListener('input', checkYamlFields);

// File input change handler
fileInput.addEventListener('change', function(e) {
  const file = this.files[0];

  // Reset everything
  errorEl.textContent = '';
  previewEl.innerHTML = '';
  container.innerHTML = '';
  linkBox.textContent = '';
  lastCopied = null;
  currentNext = null;
  lastPixelList = null;
  yamlSection.style.display = 'none';

  if (!file) return;

  const img = new Image();
  const url = URL.createObjectURL(file);
  img.src = url;

  img.onload = async () => {
    const w = img.width;
    const h = img.height;

    // Validate 16x16
    if (w !== 16 || h !== 16) {
      errorEl.textContent = `Error: Only 16x16 textures supported. ${w}x${h} detected.`;
      URL.revokeObjectURL(url);
      return;
    }

    // Show preview
    previewEl.innerHTML = `<img src="${url}" alt="Imported 16x16 preview">`;

    // Process image
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, w, h).data;

    const lines = [];
    const fullList = [];

    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];

        if (a === 0) {
          row.push('0');
          fullList.push('0');
        } else {
          const hex = "#" +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');

          row.push(hex);
          fullList.push(hex);
        }
      }
      lines.push(row.join(", "));
    }

    // Create line boxes
    lines.forEach((line, idx) => {
      container.appendChild(createLineBox(line, idx));
    });

    const first = container.querySelector('.hex-line-box');
    if (first) setNext(first);

    // Generate pixel list for YAML
    lastPixelList = fullList.map(rgbToDecimal);
    
    // Show YAML section
    yamlSection.style.display = 'block';
    checkYamlFields();

    URL.revokeObjectURL(url);
  };

  img.onerror = () => {
    errorEl.textContent = "Error: could not load the image.";
    URL.revokeObjectURL(url);
  };
});

// Generate YAML button handler
document.getElementById("generateYAML").addEventListener("click", () => {
  if (!lastPixelList) {
    alert("Import a texture first.");
    return;
  }

  const id = document.getElementById("yamlID").value.trim();
  const name = document.getElementById("yamlName").value.trim();
  const mat = document.getElementById("yamlMaterial").value.trim();
  const cat = document.getElementById("yamlCategory").value;

  if (!id || !name || !mat) {
    alert("Please fill in all fields (ID, Name, and Material).");
    return;
  }

  let yaml = "";
  yaml += `id: ${id}\n`;
  yaml += `name: ${name}\n`;
  yaml += `category: ${cat}\n`;
  yaml += `material: ${mat}\n`;
  yaml += `pixels:\n`;

  // Only add pixels that are NOT 0, with proper indentation
  lastPixelList.forEach((v, i) => {
    if (v !== 0) {
      yaml += `  '${i}': ${v}\n`;
    }
  });

  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);

  const dl = document.createElement('a');
  dl.href = url;
  dl.download = `${id}.yml`;
  dl.click();
  
  URL.revokeObjectURL(url);
});
