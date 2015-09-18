package com.softql.apicem.model;

import java.io.Serializable;
import java.util.Date;

public class logDetail implements Serializable{
	
private Long Id;

private Long userId;

private String message;

private String type;

private Date createdDate;


public Long getUserId() {
	return userId;
}
public void setUserId(Long userId) {
	this.userId = userId;
}

public String getMessage(){
	return message;
}

public void setMessage(String message){
	this.message = message;
}

public String getType() {
	return type;
}

public void setType(String type){
	this.type = type;
}

public Date getcreatedDate(){
	return createdDate;
}

public void setcreatedDate(Date createdDate){
	this.createdDate = createdDate;
}

@Override
public String toString() {
    return "{" + "UserId:" + userId + ", message:" + message + "type:" + type + "createdDate:" + createdDate + "}";
}


}
