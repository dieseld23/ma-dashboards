/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import com.infiniteautomation.dashboards.Lifecycle;
import com.serotonin.m2m2.module.ModuleRegistry;
import com.serotonin.m2m2.module.UriMappingDefinition;
import com.serotonin.m2m2.web.mvc.UrlHandler;

/**
 * @author Terry Packer
 *
 */
public class PublicDashboardUriMappingDefinition extends UriMappingDefinition{

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getPermission()
	 */
	@Override
	public Permission getPermission() {
		return Permission.ANONYMOUS;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getPath()
	 */
	@Override
	public String getPath() {
		return "/public-dashboards/**";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getHandler()
	 */
	@Override
	public UrlHandler getHandler() {
		return new PublicDashboardUrlHandler(ModuleRegistry.getModule(Lifecycle.moduleName).getDirectoryPath());
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getJspPath()
	 */
	@Override
	public String getJspPath() {
		return null;
	}

}
