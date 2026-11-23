const handleSubmit = async (e, cb) => {
  e.preventDefault();
  let formData = new FormData(e.target);
  let obj = Object.fromEntries(formData);
  await cb(obj);
  e.target.reset();
};

export default handleSubmit;
