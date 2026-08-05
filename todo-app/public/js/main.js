document.addEventListener('DOMContentLoaded', () => {
  const deleteForms = document.querySelectorAll('form[action*="/delete"]');

  deleteForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const confirmed = window.confirm('Are you sure you want to delete this task?');
      if (!confirmed) {
        event.preventDefault();
      }
    });
  });
});
