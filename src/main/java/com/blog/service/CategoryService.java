//package com.blog.service;
//
//import com.blog.dto.request.CategoryRequest;
//import com.blog.entity.Category;
//import java.util.List;
//
//public interface CategoryService {
//
//    Category createCategory(CategoryRequest request);
//
//    Category updateCategory(Long id, CategoryRequest request);
//
//    void deleteCategory(Long id);
//
//    Category getCategory(Long id);
//
//    List<Category> getAllCategories();
//
//    Category assignCategoryToPost(Long postId, Long categoryId);
//}
//
//



package com.blog.service;

import com.blog.dto.request.CategoryRequest;
import com.blog.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    CategoryResponse getCategory(Long id);

    List<CategoryResponse> getAllCategories();

    CategoryResponse assignCategoryToPost(Long postId, Long categoryId);
}
