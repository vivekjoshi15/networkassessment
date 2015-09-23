package com.softql.apicem.api.discovery;

import com.softql.apicem.api.controller.BaseRestController;
import com.softql.apicem.exception.SearchException;
import com.softql.apicem.model.DiscoveryDevices;
import com.softql.apicem.model.DiscoveryExcelFiles;
import com.softql.apicem.model.ResponseMessage;
import com.softql.apicem.model.UserDetails;
import com.softql.apicem.model.logDetail;
import com.softql.apicem.service.ApicEmService;
import com.softql.apicem.util.ApicemUtils;
import com.softql.apicem.util.URLUtil;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.rmi.server.ExportException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.logging.Level;

import javax.inject.Inject;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.xssf.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value={"/api/discovery"})
public class SearchController
extends BaseRestController {
    private static final Logger log = LoggerFactory.getLogger(SearchController.class);
    @Inject
    private ApicEmService apicEmService;
    
    @Inject
	private MongoOperations mongoTemplate;

    @RequestMapping(value={"/search"}, method={RequestMethod.GET})
    @ResponseBody
    public ResponseEntity<List<DiscoveryDevices>> getDevices(@RequestParam(value="from", required=false) String fromIP, @RequestParam(value="q", required=false) String keyword, HttpServletRequest request) throws SearchException {
        List<DiscoveryDevices> discoveryDevices = new ArrayList<DiscoveryDevices>();
        String url = URLUtil.constructUrl(request.getHeader("apicem"), null, request.getHeader("version"), "/network-device/1/10000000", request.getHeader("X-Access-Token"));
        try {
            discoveryDevices = this.apicEmService.getDevices(url);
        }
        catch (Exception e) {
            e.printStackTrace();	
            throw new SearchException();
        }
        String tagurl = URLUtil.constructUrl(request.getHeader("apicem"), null, request.getHeader("version"), "/network-device/tag", request.getHeader("X-Access-Token"));
        Map<String, String> tags = this.apicEmService.getTags(tagurl);
        for (DiscoveryDevices d : discoveryDevices) {
            d.setTags((String)tags.get(d.getId()));
        }
        log.debug("get posts size {}", (Object)discoveryDevices.size());
        return new ResponseEntity(discoveryDevices, HttpStatus.OK);
    }

    @RequestMapping(value={"{groupType}/groupby"}, method={RequestMethod.POST})
    @ResponseBody
    public ResponseEntity<Collection<DiscoveryDevices>> groupByData(@PathVariable(value="groupType") String groupType, @RequestBody List<DiscoveryDevices> deviceList) {
        HashMap<String, DiscoveryDevices> deviceMap = new HashMap<String, DiscoveryDevices>();
        if (!CollectionUtils.isEmpty(deviceList)) {
            for (DiscoveryDevices device : deviceList) {
                String platformId = device.getPlatformId();
                DiscoveryDevices thinDevice = new DiscoveryDevices();
                thinDevice.setPlatformId(platformId);
                thinDevice.setQty(1);
                thinDevice.setLocationName(device.getLocationName());
                thinDevice.setTags(device.getTags());
                thinDevice.setType(device.getType()); 
                thinDevice.setSoftwareVersion(device.getSoftwareVersion());
                if (deviceMap.containsKey(platformId)) {
                    DiscoveryDevices discoveryDevice = (DiscoveryDevices)deviceMap.get(platformId);
                    int qty = discoveryDevice.getQty() + 1;
                    thinDevice.setQty(qty);
                    thinDevice.setLocationName(ApicemUtils.join(',', new String[]{discoveryDevice.getLocationName(), device.getLocationName()}));
                    thinDevice.setTags(ApicemUtils.join(',', new String[]{discoveryDevice.getTags(), device.getTags()}));
                    thinDevice.setSoftwareVersion(ApicemUtils.join(',', new String[]{discoveryDevice.getSoftwareVersion(), device.getSoftwareVersion()}));
                    deviceMap.put(platformId, thinDevice);
                    continue;
                }
                deviceMap.put(platformId, thinDevice);
            }
        }
        return new ResponseEntity(deviceMap.values(), HttpStatus.OK);
    }

    @RequestMapping(value={"export"}, method={RequestMethod.POST})
    @ResponseBody
    public ResponseEntity<ResponseMessage> export(@RequestBody List<DiscoveryDevices> deviceList, HttpServletResponse response) throws ExportException {
        ResponseMessage alert = new ResponseMessage(ResponseMessage.Type.success, "success.UPDATE.APIC", this.messageSource.getMessage("success.UPDATE.APIC", (Object[])new String[0], null));
        try {
            InputStream resourceAsStream = this.getClass().getClassLoader().getResourceAsStream("Network_Assessment_app.xlsx");
            XSSFWorkbook workbook = new XSSFWorkbook(resourceAsStream); 
            XSSFSheet sheet = workbook.getSheetAt(0);
            int router = 0;
            int switches = 0;
            int wireless = 0;
            int startRow = 6;
            for (DiscoveryDevices devices : deviceList) {
                XSSFRow row = sheet.createRow(startRow);
                row.createCell(0).setCellValue(devices.getPlatformId());
                row.createCell(1).setCellValue(devices.getType());
                row.createCell(2).setCellValue(devices.getSoftwareVersion());
                row.createCell(3).setCellValue(devices.getLocationName());
                row.createCell(4).setCellValue(devices.getTags());
                row.createCell(5).setCellValue(devices.getFamily());
                row.createCell(6).setCellValue(devices.getVendor());
                row.createCell(7).setCellValue(devices.getHostname());
                row.createCell(8).setCellValue(devices.getSerialNumber());
                row.createCell(9).setCellValue(devices.getManagementIpAddress());
                row.createCell(10).setCellValue(devices.getMacAddress());
                row.createCell(11).setCellValue(devices.getReachabilityStatus());
                ++startRow;
                if (StringUtils.equalsIgnoreCase((CharSequence)devices.getType(), (CharSequence)"ROUTER")) {
                    ++router;
                    continue;
                }
                if (StringUtils.equalsIgnoreCase((CharSequence)devices.getType(), (CharSequence)"SWITCH")) {
                    ++switches;
                    continue;
                }
                if (!StringUtils.equalsIgnoreCase((CharSequence)devices.getType(), (CharSequence)"WIRELESS")) continue;
                ++wireless;
            }
            String headerValue = sheet.getRow(3).getCell(0).getStringCellValue();
            headerValue = StringUtils.replace(headerValue, "ALL", (String)String.valueOf(router + switches + wireless));
            headerValue = StringUtils.replace(headerValue, "RUT", (String)String.valueOf(router));
            headerValue = StringUtils.replace(headerValue, "SWT", (String)String.valueOf(switches));
            headerValue = StringUtils.replace(headerValue, "WRL", (String)String.valueOf(wireless));
            sheet.getRow(3).getCell(0).setCellValue(headerValue);
            File temp = File.createTempFile("Network_Assessment_App", ".xlsx");
            FileOutputStream fileOut = new FileOutputStream(temp.getAbsolutePath());
            workbook.write((OutputStream)fileOut);
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            workbook.write((OutputStream)byteArrayOutputStream);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=Network_Assessment_App.xlsx");
            response.setContentLength(byteArrayOutputStream.toByteArray().length);
            ServletOutputStream out = response.getOutputStream();
            out.write(byteArrayOutputStream.toByteArray());
            out.flush();
            out.close();
            fileOut.close();
            byteArrayOutputStream.close();
        }
        catch (Exception e) {
            e.printStackTrace();
            throw new ExportException(e.getMessage());
        }
        return new ResponseEntity(alert, HttpStatus.OK);
    }
    
    @RequestMapping(value={"exportFile"}, method={RequestMethod.POST})
    @ResponseBody
    public ResponseEntity<ResponseMessage> exportFile(@RequestBody Long id, HttpServletResponse response) throws ExportException {
        ResponseMessage alert = new ResponseMessage(ResponseMessage.Type.success, "success.UPDATE.APIC", this.messageSource.getMessage("success.UPDATE.APIC", (Object[])new String[0], null));
        try {
            InputStream resourceAsStream = this.getClass().getClassLoader().getResourceAsStream("Network_Assessment_app.xlsx");
            XSSFWorkbook workbook = new XSSFWorkbook(resourceAsStream); 
            XSSFSheet sheet = workbook.getSheetAt(0);
            int router = 0;
            int switches = 0;
            int wireless = 0;
            int startRow = 6;
            
            Query findUserQuery = new Query();
    		findUserQuery.addCriteria(Criteria.where("id").is(id));
    		DiscoveryExcelFiles file = mongoTemplate.findOne(findUserQuery, DiscoveryExcelFiles.class, "apicExcelFiles");
    		List<DiscoveryDevices> deviceList=file.getFileData();
    		
            for (DiscoveryDevices devices : deviceList) {
                XSSFRow row = sheet.createRow(startRow);
                row.createCell(0).setCellValue(devices.getPlatformId());
                row.createCell(1).setCellValue(devices.getType());
                row.createCell(2).setCellValue(devices.getSoftwareVersion());
                row.createCell(3).setCellValue(devices.getLocationName());
                row.createCell(4).setCellValue(devices.getTags());
                row.createCell(5).setCellValue(devices.getFamily());
                row.createCell(6).setCellValue(devices.getVendor());
                row.createCell(7).setCellValue(devices.getHostname());
                row.createCell(8).setCellValue(devices.getSerialNumber());
                row.createCell(9).setCellValue(devices.getManagementIpAddress());
                row.createCell(10).setCellValue(devices.getMacAddress());
                row.createCell(11).setCellValue(devices.getReachabilityStatus());
                ++startRow;
                if (StringUtils.equalsIgnoreCase((CharSequence)devices.getType(), (CharSequence)"ROUTER")) {
                    ++router;
                    continue;
                }
                if (StringUtils.equalsIgnoreCase((CharSequence)devices.getType(), (CharSequence)"SWITCH")) {
                    ++switches;
                    continue;
                }
                if (!StringUtils.equalsIgnoreCase((CharSequence)devices.getType(), (CharSequence)"WIRELESS")) continue;
                ++wireless;
            }
            String headerValue = sheet.getRow(3).getCell(0).getStringCellValue();
            headerValue = StringUtils.replace(headerValue, "ALL", (String)String.valueOf(router + switches + wireless));
            headerValue = StringUtils.replace(headerValue, "RUT", (String)String.valueOf(router));
            headerValue = StringUtils.replace(headerValue, "SWT", (String)String.valueOf(switches));
            headerValue = StringUtils.replace(headerValue, "WRL", (String)String.valueOf(wireless));
            sheet.getRow(3).getCell(0).setCellValue(headerValue);
            File temp = File.createTempFile("Network_Assessment_App", ".xlsx");
            FileOutputStream fileOut = new FileOutputStream(temp.getAbsolutePath());
            workbook.write((OutputStream)fileOut);
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            workbook.write((OutputStream)byteArrayOutputStream);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=Network_Assessment_App.xlsx");
            response.setContentLength(byteArrayOutputStream.toByteArray().length);
            ServletOutputStream out = response.getOutputStream();
            out.write(byteArrayOutputStream.toByteArray());
            out.flush();
            out.close();
            fileOut.close();
            byteArrayOutputStream.close();
        }
        catch (Exception e) {
            e.printStackTrace();
            throw new ExportException(e.getMessage());
        }
        return new ResponseEntity(alert, HttpStatus.OK);
    }
    
    @RequestMapping(value={"saveExcel"}, method={RequestMethod.POST})
    @ResponseBody
    public ResponseEntity<String> saveExcel(@RequestBody DiscoveryExcelFiles file) {
    	if (log.isDebugEnabled()) {
            log.debug(Level.FINE +"get current user info");
        }    	
    	
	   	try	{
		   	Date now = new Date();
		   	 
		   	file.setCreatedDate(now); 	 
		   	
		   	mongoTemplate.save(file, "apicExcelFiles");  
	   	}
	   	catch (Exception e) {
	   		return new ResponseEntity<>("Error", HttpStatus.BAD_REQUEST);
	   	}
	   	
        if (log.isDebugEnabled()) {
            log.debug("current file value @" + file);
        }
        
        return new ResponseEntity<>("Success", HttpStatus.CREATED);
    }
    
    @RequestMapping(value={"/getExcelFileList"}, method={RequestMethod.GET})
    @ResponseBody
    public ResponseEntity<List<DiscoveryExcelFiles>> getExcelFiles(@RequestParam(value="id", required=true) Long id,@RequestParam(value="from", required=false) String fromDate, @RequestParam(value="to", required=false) String toDate, HttpServletRequest request) throws SearchException {
    	Query findUserQuery = new Query();
    	if(StringUtils.isNotEmpty(fromDate) && StringUtils.isNoneBlank(fromDate)){
    		DateFormat format = new SimpleDateFormat("MMMM d, yyyy", Locale.ENGLISH);
    		Date date;
			try {
				date = format.parse(fromDate);
	    		findUserQuery.addCriteria(Criteria.where("userId").is(id).and("createdDate").is(date));
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace(); 
			}
    	}
    	else
    	{
    		Query findUserRoleQuery = new Query();
    		findUserRoleQuery.addCriteria(Criteria.where("id").is(id));
    		UserDetails User = mongoTemplate.findOne(findUserRoleQuery, UserDetails.class, "apicUser");
    		String role=User.getRole();
    		if(StringUtils.equalsIgnoreCase(role, "admin"))
    		{
    			
    		}
    		else
    		{
    			findUserQuery.addCriteria(Criteria.where("userId").is(id));
    		}
    	}
		List<DiscoveryExcelFiles> files = mongoTemplate.find(findUserQuery, DiscoveryExcelFiles.class, "apicExcelFiles");
		//for (final DiscoveryExcelFiles file : files) {
		//	file.setUserName("");
		//}
		
        return new ResponseEntity(files, HttpStatus.OK);
    }
}