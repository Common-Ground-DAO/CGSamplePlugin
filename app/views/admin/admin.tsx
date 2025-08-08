import React from 'react'

const Admin = () => {
  return (<div>
    <h1>Admin Page</h1>
    <p>This is the admin page of the sample plugin. If you are seeing this, it means you have admin privileges on the community. Normal users normally can't see this.</p>
    <br/>
    <p>Currently, this page is just a placeholder and does not have any functionality. But in a real application, you could set and save settings here in a database, and thus could easily swap data or functionality for the plugin users.</p>
  </div>)
}

export default Admin