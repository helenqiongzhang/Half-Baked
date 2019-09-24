import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {auth, clearCart} from '../store'
import LoginNotif from './Notification/loginNotif'

/**
 * COMPONENT
 */
const AuthForm = props => {
  const {name, displayName, handleSubmit, error} = props

  return (
    <div id="form-div">
      <div id="sides" />
      <div id="middle-form">
        <form onSubmit={handleSubmit} name={name}>
          <div>
            <label htmlFor="email">
              <small>Email</small>
            </label>
            <input name="email" type="text" />
          </div>

          <p>
            <div>
              <label htmlFor="password">
                <small>Password</small>
              </label>
              <input name="password" type="password" />
            </div>
          </p>
          <div>
            <button type="submit">{displayName}</button>
            <LoginNotif />
          </div>
          {error && error.response && <div> {error.response.data} </div>}
        </form>

        {/* <a href="/auth/google">{displayName} with Google</a> */}
        <a href="/auth/google">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUdBIMn1pBU7a38f2R-YS4gNnapOyWNTfp_IKorWOTvQZimyuk"
            id="google-butt"
          />
        </a>
      </div>
      <div id="sides" />
    </div>
  )
}

/**
 * CONTAINER
 *   Note that we have two different sets of 'mapStateToProps' functions -
 *   one for Login, and one for Signup. However, they share the same 'mapDispatchToProps'
 *   function, and share the same Component. This is a good example of how we
 *   can stay DRY with interfaces that are very similar to each other!
 */
const mapLogin = state => {
  return {
    name: 'login',
    displayName: 'Login',
    error: state.user.error
  }
}

const mapSignup = state => {
  return {
    name: 'signup',
    displayName: 'Sign Up',
    error: state.user.error
  }
}

const mapDispatch = dispatch => {
  return {
    handleSubmit(evt) {
      evt.preventDefault()
      const formName = evt.target.name
      const email = evt.target.email.value
      const password = evt.target.password.value
      dispatch(auth(email, password, formName))
      dispatch(clearCart())
    }
  }
}

export const Login = connect(mapLogin, mapDispatch)(AuthForm)
export const Signup = connect(mapSignup, mapDispatch)(AuthForm)

/**
 * PROP TYPES
 */
AuthForm.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.object
}
