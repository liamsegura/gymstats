const followButton = document.querySelector('#follow-form button');
const unfollowButton = document.querySelector('#unfollow-form button');
const getToken = () => {
  const tokenCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  } else {
    return null;
  }
};

const token = getToken();
if (token) {
  // Use the token to make authenticated requests
} else {
  // Redirect to the login page
}

console.log(token)

if (followButton) {
  followButton.addEventListener('click', followUser);
}

if (unfollowButton) {
  unfollowButton.addEventListener('click', unfollowUser);
}

async function followUser(event) {
  event.preventDefault();
  
  console.log(event.target.form.action)
  const response = await fetch(`http://localhost:3000${event.target.form.action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`} ,
  });

  if (response.ok) {
   
    const json = await response.json();

    // Update the UI to reflect that the user is now following the target user
    const followForm = event.target.form;
    followForm.parentNode.replaceChild(createUnfollowButton(), followForm);
    const followerCountSpan = document.querySelector('#follower-count');
    const followerCount = parseInt(followerCountSpan.textContent) + 1;
    followerCountSpan.textContent = followerCount;
  } else {
    console.error(response.statusText);
  }
}

async function unfollowUser(event) {
  event.preventDefault();

  const response = await fetch(`http://localhost:3000${event.target.form.action}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    const json = await response.json();

    // Update the UI to reflect that the user is no longer following the target user
    const unfollowForm = event.target.form;
    unfollowForm.parentNode.replaceChild(createFollowButton(), unfollowForm);
    const followerCountSpan = document.querySelector('#follower-count');
    const followerCount = parseInt(followerCountSpan.textContent) - 1;
    followerCountSpan.textContent = followerCount;
  } else {
    console.error(response.statusText);
  }
}

function createFollowButton() {
  const form = document.createElement('form');
  form.id = 'follow-form';
  form.action = `/users/${loggedUser._id}/follow/${user._id}`;
  form.method = 'POST';

  const button = document.createElement('button');
  button.classList.add('col-3', 'btn', 'btn-primary');
  button.type = 'submit';
  button.innerText = 'Follow';

  form.appendChild(button);

  return form;
}

function createUnfollowButton() {
  const form = document.createElement('form');
  form.id = 'unfollow-form';
  form.action = `/users/${loggedUser._id}/unfollow/${user._id}?_method=DELETE`;
  form.method = 'POST';

  const button = document.createElement('button');
  button.classList.add('col-3', 'btn', 'btn-primary');
  button.innerText = 'Unfollow';
  form.appendChild(button);

  return form;
}
