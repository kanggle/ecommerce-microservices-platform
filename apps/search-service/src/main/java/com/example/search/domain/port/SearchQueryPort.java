package com.example.search.domain.port;

import com.example.search.application.dto.SearchProductQuery;
import com.example.search.application.dto.SearchProductResult;

public interface SearchQueryPort {

    SearchProductResult search(SearchProductQuery query);
}
