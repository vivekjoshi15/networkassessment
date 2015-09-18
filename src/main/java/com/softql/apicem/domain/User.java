package com.softql.apicem.domain;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
public class User implements UserDetails, Serializable {

	/**
     *
     */
	private static final long serialVersionUID = 1L;

	@Id()
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "username")
	private String username;

	@Column(name = "password")
	private String password;

	@Column(name = "name")
	private String name;

	@Column(name = "email")
	private String email;

	@Column(name = "role")
	private String role;

	@Column(name = "created_date")
	@CreatedDate
	private Date createdDate;

	private String apicUserName;

	private String apicPassword;

	private String apicIp;

	private String version;

	private String token;

	public User() {
	}

	public User(String username, String password, String name, String role) {
		this.username = username;
		this.password = password;
		this.name = name;
		this.role = role;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		if (this.name == null || this.name.trim().length() == 0) {
			return this.username;
		}
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Arrays.asList(new SimpleGrantedAuthority("ROLE_" + this.role));
	}

	@Override
	public String getPassword() {
		return this.password;
	}

	@Override
	public String getUsername() {
		return this.username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	public String getApicUserName() {
		return apicUserName;
	}

	public void setApicUserName(String apicUserName) {
		this.apicUserName = apicUserName;
	}

	public String getApicPassword() {
		return apicPassword;
	}

	public void setApicPassword(String apicPassword) {
		this.apicPassword = apicPassword;
	}

	public String getApicIp() {
		return apicIp;
	}

	public void setApicIp(String apicIp) {
		this.apicIp = apicIp;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	@Override
	public String toString() {
		return "User [id=" + id + ", username=" + username + ", password=" + password + ", name=" + name + ", role="
				+ role + "]";
	}

}
