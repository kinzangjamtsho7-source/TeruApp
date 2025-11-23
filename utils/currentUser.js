let currentUser = null;

exports.setCurrentUser = (user) => {
  currentUser = user;
};

exports.getCurrentUser = () => currentUser;

exports.logout = () => {
  currentUser = null;
};