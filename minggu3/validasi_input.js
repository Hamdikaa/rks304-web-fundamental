// validasi_input.js
const STORAGE_USERS = 'users';
const STORAGE_CURRENT = 'currentUser';

const form = document.getElementById('registerForm');

const fields = {
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  nama: document.getElementById('nama'),
  tanggalLahir: document.getElementById('tanggalLahir'),
  alamat: document.getElementById('alamat'),
  telpon: document.getElementById('telpon'),
};

// ---------- Helper ----------

// Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD
function todayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
  } catch (err) {
    return [];
  }
}

// Tampilkan / sembunyikan pesan error
function setError(id, message) {
  const errorEl = document.getElementById(id + 'Error');
  const input = fields[id];
  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    input.classList.add('border-red-500');
    input.classList.remove('border-gray-300');
  } else {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    input.classList.remove('border-red-500');
    input.classList.add('border-gray-300');
  }
}

// ---------- Aturan validasi ----------
// Setiap fungsi mengembalikan pesan error, atau '' jika valid.
const validators = {
  username() {
    const v = fields.username.value.trim();
    if (v === '') return 'Username tidak boleh kosong';
    if (v.length < 3) return 'Username minimal 3 karakter';
    const sudahAda = getUsers().some((u) => u.username.toLowerCase() === v.toLowerCase());
    if (sudahAda) return 'Username sudah dipakai, pilih yang lain';
    return '';
  },
  password() {
    const v = fields.password.value;
    if (v === '') return 'Password tidak boleh kosong';
    if (v.length < 8) return 'Password minimal 8 karakter';
    return '';
  },
  nama() {
    if (fields.nama.value.trim() === '') return 'Nama tidak boleh kosong';
    return '';
  },
  tanggalLahir() {
    const v = fields.tanggalLahir.value;
    if (v === '') return 'Tanggal lahir tidak boleh kosong';
    // format YYYY-MM-DD bisa dibandingkan langsung sebagai string
    if (v > todayString()) return 'Tanggal lahir tidak boleh melebihi hari ini';
    return '';
  },
  alamat() {
    if (fields.alamat.value.trim() === '') return 'Alamat tidak boleh kosong';
    return '';
  },
  telpon() {
    const v = fields.telpon.value.trim();
    if (v === '') return 'Nomor telpon tidak boleh kosong';
    if (!v.startsWith('62')) return 'Nomor telpon harus diawali dengan 62';
    if (!/^\d+$/.test(v)) return 'Nomor telpon hanya boleh berisi angka';
    return '';
  },
};

function validateField(id) {
  const message = validators[id]();
  setError(id, message);
  return message === '';
}

// ---------- Event handling ----------

// Batasi input tanggal lahir sampai hari ini di date picker
fields.tanggalLahir.max = todayString();

// Validasi saat mengetik dan saat meninggalkan field
Object.keys(fields).forEach((id) => {
  fields[id].addEventListener('blur', () => validateField(id));
  fields[id].addEventListener('input', () => validateField(id));
});

// Tombol lihat/sembunyikan password
document.getElementById('togglePassword').addEventListener('click', function () {
  const hidden = fields.password.type === 'password';
  fields.password.type = hidden ? 'text' : 'password';
  this.textContent = hidden ? 'Sembunyikan' : 'Lihat';
});

// Validasi saat submit
form.addEventListener('submit', function (e) {
  let isValid = true;
  let firstInvalid = null;

  Object.keys(fields).forEach((id) => {
    if (!validateField(id)) {
      isValid = false;
      if (!firstInvalid) firstInvalid = fields[id];
    }
  });

  // Ada yang salah: batalkan submit dan fokus ke field pertama yang error
  if (!isValid) {
    e.preventDefault();
    firstInvalid.focus();
    return;
  }

  // Semua valid: simpan data (password TIDAK disimpan di browser)
  const user = {
    id: Date.now(),
    username: fields.username.value.trim(),
    nama: fields.nama.value.trim(),
    tanggalLahir: fields.tanggalLahir.value,
    alamat: fields.alamat.value.trim(),
    telpon: fields.telpon.value.trim(),
    terdaftar: new Date().toISOString(),
  };

  try {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_CURRENT, String(user.id));
  } catch (err) {
    e.preventDefault();
    alert('Data gagal disimpan. Pastikan penyimpanan browser tidak diblokir.');
    return;
  }

  // Nonaktifkan field supaya data (terutama password) tidak ikut terkirim di URL.
  // Setelah ini form lanjut submit ke dashboard.html sesuai atribut action.
  Object.values(fields).forEach((input) => (input.disabled = true));
});
