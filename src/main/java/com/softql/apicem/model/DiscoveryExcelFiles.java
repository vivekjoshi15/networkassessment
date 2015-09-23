package com.softql.apicem.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 *
 * @author
 *
 */
public class DiscoveryExcelFiles implements Serializable {

	private static final long serialVersionUID = 1L;

	private Long id;

	private Long userId;

	private String userName;

	private String filename;
    
    private Date createdDate;

	private List<DiscoveryDevices> fileData;
	
	public Long getUserId() {
		return userId;
	}
	
	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public String getFilename() {
		return filename;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public void setFilename(String filename) {
		this.filename = filename;
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

	public List<DiscoveryDevices> getFileData() {
		return fileData;
	}

	public void setFileData(List<DiscoveryDevices> fileData) {
		this.fileData = fileData;
	}
	
	@Override
	public String toString() {
	    return "{" + "filename:" + filename + ", createdDate:" + createdDate + ", id:" + id + '}';
	}

}
