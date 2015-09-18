/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.softql.apicem.model;

import java.io.Serializable;
import java.util.Date;

/**
 *
 * @author 
 */
public class UserDetails implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;

    private String username;

    private String name;

    private String email;

    private String role;
    
    private Date createdDate;
    
    private String password;
    
    public String getPassword(){
    	return password;
    }
    public void setPassword(String password){
    	this.password = password;
    }
    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    
    
    @Override
    public String toString() {
        return "{" + "username:" + username + ", password:" + password + ", name:" + name + ", email:" + email + ", role:" + role + '}';
    }

}
