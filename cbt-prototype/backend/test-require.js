const deps = ['express', 'cors', 'dotenv', 'bcryptjs', 'jsonwebtoken', 'better-sqlite3'];
let missing = false;
deps.forEach((dep) => {
  try {
    console.log(dep, require.resolve(dep));
  } catch (err) {
    console.error(dep, 'ERROR', err.message);
    missing = true;
  }
});
if (!missing) console.log('ALL_OK');
